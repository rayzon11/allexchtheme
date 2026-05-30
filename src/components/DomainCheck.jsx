import { useEffect, useState } from "react";

const TLDS = [".com", ".net", ".io", ".bet", ".live", ".club", ".vip", ".casino"];
const PREFIXES = ["", "bet", "play", "my", "go"];
const SUFFIXES = ["", "247", "club", "win", "bet"];
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;

async function checkViaRdap(fqdn) {
  const res = await fetch(`https://rdap.org/domain/${fqdn}`, {
    method: "GET",
    headers: { Accept: "application/rdap+json" },
  });
  if (res.status === 404) return { available: true, source: "rdap" };
  if (res.ok) return { available: false, source: "rdap" };
  throw new Error(`RDAP ${res.status}`);
}

async function checkViaDoh(fqdn) {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(fqdn)}&type=NS`,
    { headers: { Accept: "application/dns-json" } }
  );
  if (!res.ok) throw new Error(`DOH ${res.status}`);
  const data = await res.json();
  const hasNs = Array.isArray(data.Answer) && data.Answer.some((a) => a.type === 2);
  if (data.Status === 3 && !hasNs) return { available: true, source: "doh" };
  return { available: !hasNs, source: "doh" };
}

async function checkDomain(fqdn) {
  try {
    return await checkViaRdap(fqdn);
  } catch (_) {
    return await checkViaDoh(fqdn);
  }
}

// Build a fixed-size list of brand variants (deduped) for "Suggest" mode.
function buildVariants(base) {
  const seen = new Set();
  const out = [];
  for (const p of PREFIXES) {
    for (const s of SUFFIXES) {
      const name = `${p}${base}${s}`.toLowerCase();
      if (!DOMAIN_RE.test(name) || seen.has(name)) continue;
      seen.add(name);
      out.push(name);
      if (out.length >= 12) return out;
    }
  }
  return out;
}

export default function DomainCheck({ value, onChange, onUseAsName, siteName, history, addHistory }) {
  const [name, setName] = useState(value ? value.replace(/\.[a-z]+$/i, "") : "");
  const [tld, setTld] = useState(".com");
  const [state, setState] = useState({ status: "idle", message: "", fqdn: "" });
  const [tldResults, setTldResults] = useState([]);   // parallel results for ALL tlds
  const [variantResults, setVariantResults] = useState([]); // brand-variant suggestions

  // Pre-fill from siteName if the field is empty.
  useEffect(() => {
    if (!name && siteName) {
      setName(siteName.toLowerCase().replace(/[^a-z0-9-]/g, ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteName]);

  const cleanName = name.trim().toLowerCase();
  const fqdn = `${cleanName}${tld}`;

  const oneCheck = async (candidate) => {
    try {
      return { fqdn: candidate, ...(await checkDomain(candidate)) };
    } catch {
      return { fqdn: candidate, available: null, source: "error" };
    }
  };

  const onCheck = async () => {
    if (!cleanName || !DOMAIN_RE.test(cleanName)) {
      setState({ status: "error", message: "Enter a valid domain (letters, numbers, hyphens).", fqdn: "" });
      setTldResults([]);
      setVariantResults([]);
      return;
    }
    setState({ status: "checking", message: `Checking ${cleanName} across all TLDs…`, fqdn });
    setTldResults([]);
    setVariantResults([]);

    // Fire all TLDs in parallel so the customer sees every option at once.
    const tldCandidates = TLDS.map((t) => `${cleanName}${t}`);
    const tldPromises = tldCandidates.map(oneCheck);
    const settled = await Promise.all(tldPromises);
    setTldResults(settled);

    const primary = settled.find((r) => r.fqdn === fqdn) || settled[0];
    if (primary?.available) {
      setState({ status: "available", message: "is available", fqdn: primary.fqdn });
      onChange?.(primary.fqdn);
      addHistory?.({ domain: primary.fqdn, available: true });
    } else if (primary) {
      setState({ status: "taken", message: "is taken — see other TLDs below", fqdn: primary.fqdn });
      addHistory?.({ domain: primary.fqdn, available: false });
    }
  };

  const onSuggest = async () => {
    if (!cleanName || !DOMAIN_RE.test(cleanName)) {
      setState({ status: "error", message: "Enter a base name first.", fqdn: "" });
      return;
    }
    setState({ status: "checking", message: `Generating brand variants for ${cleanName}…`, fqdn: "" });
    setVariantResults([]);
    const variants = buildVariants(cleanName).map((n) => `${n}${tld}`);
    const settled = await Promise.all(variants.map(oneCheck));
    setVariantResults(settled);
    setState({ status: "idle", message: "", fqdn: "" });
  };

  return (
    <div>
      <div className="domain-input-row">
        <input
          type="text"
          className="domain-input"
          placeholder="yourbrand"
          value={name}
          onChange={(e) => setName(e.target.value.replace(/[^a-z0-9-]/gi, ""))}
          onKeyDown={(e) => e.key === "Enter" && onCheck()}
          maxLength={63}
          spellCheck={false}
        />
        <button
          className="domain-check-btn"
          onClick={onCheck}
          disabled={state.status === "checking" || !cleanName}
          title="Check this name across every TLD"
        >
          {state.status === "checking" ? "…" : "Check"}
        </button>
      </div>

      <div className="domain-tlds">
        {TLDS.map((t) => (
          <button
            key={t}
            type="button"
            className={`domain-tld ${tld === t ? "active" : ""}`}
            onClick={() => setTld(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="domain-suggest-btn"
        onClick={onSuggest}
        disabled={state.status === "checking" || !cleanName}
        title="Auto-generate brand variants (prefix + suffix combos) and check them"
      >
        💡 Suggest brand variants
      </button>

      {state.status !== "idle" && (
        <div className={`domain-result ${state.status}`}>
          <span className="dr-icon" aria-hidden="true">
            {state.status === "available" && "✓"}
            {state.status === "taken" && "✕"}
            {state.status === "checking" && "⏳"}
            {state.status === "error" && "!"}
          </span>
          <span className="dr-body">
            {state.status === "checking" || state.status === "error" ? state.message : <><strong>{state.fqdn}</strong> {state.message}</>}
          </span>
          {state.status === "available" && (
            <button type="button" className="dr-cta" onClick={() => onUseAsName?.(cleanName.toUpperCase())}>
              Use →
            </button>
          )}
        </div>
      )}

      {tldResults.length > 0 && (
        <div className="domain-block">
          <div className="domain-block-title">All TLDs for "{cleanName}"</div>
          <div className="domain-grid">
            {tldResults.map((r) => (
              <button
                key={r.fqdn}
                type="button"
                className={`domain-grid-item ${r.available === true ? "ok" : r.available === false ? "no" : "err"}`}
                onClick={() => r.available && onChange?.(r.fqdn)}
                disabled={r.available !== true}
              >
                <span className="dom">{r.fqdn}</span>
                <span className="dom-tag">
                  {r.available === true ? "✓" : r.available === false ? "✕" : "?"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {variantResults.length > 0 && (
        <div className="domain-block">
          <div className="domain-block-title">Brand variants</div>
          <div className="domain-grid">
            {variantResults
              .slice()
              .sort((a, b) => Number(b.available === true) - Number(a.available === true))
              .map((r) => (
                <button
                  key={r.fqdn}
                  type="button"
                  className={`domain-grid-item ${r.available === true ? "ok" : r.available === false ? "no" : "err"}`}
                  onClick={() => r.available && onChange?.(r.fqdn)}
                  disabled={r.available !== true}
                >
                  <span className="dom">{r.fqdn}</span>
                  <span className="dom-tag">
                    {r.available === true ? "✓" : r.available === false ? "✕" : "?"}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      {history && history.length > 0 && (
        <div className="domain-history">
          <div className="domain-history-title">Recent checks</div>
          {history.slice(0, 4).map((h, i) => (
            <div key={i} className="domain-history-item">
              <span className="dom">{h.domain}</span>
              <span className={`status ${h.available ? "available" : "taken"}`}>
                {h.available ? "Available" : "Taken"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
