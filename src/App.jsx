import { useEffect, useMemo, useRef, useState } from "react";
import { useConfig, THEMES, PRODUCTS, getProduct, SKY_GROUP_COLOURS } from "./hooks/useConfig";
import Stage from "./components/Stage";
import Lightbox from "./components/Lightbox";
import OrderModal from "./components/OrderModal";
import "./site.css";

// The screens a design can have. A product only shows the ones it has captures for.
const SCREENS = [
  { id: "home", label: "Home", desktop: "desktopHome", mobile: "mobileHome" },
  { id: "login", label: "Login", desktop: "desktopLogin", mobile: "mobileLogin" },
  { id: "after", label: "After login", desktop: "desktopAfterLogin", mobile: "mobileAfterLogin" },
];

// Plain descriptions of what each platform looks like.
const PRODUCT_COPY = {
  sky: "Bright classic exchange with sports tiles and a casino lobby.",
  tiger: "Dark sportsbook with a match slider and casino rows.",
  reddy: "Dark modern lobby with a side menu, bet slip and game rows.",
};

// Body style of each platform, for the compare table.
const PRODUCT_LOOK = { sky: "Light", tiger: "Dark", reddy: "Dark" };

const GROUP_ORDER = ["Yellow", "Green", "Orange", "Red", "Blue", "Purple", "White"];

export default function App() {
  const config = useConfig();
  const { activeTheme, setActiveTheme, selectedCode, selectVariant } = config;

  const [screenId, setScreenId] = useState("home");
  const [filter, setFilter] = useState("All");
  const [orderOpen, setOrderOpen] = useState(false);
  const [zoom, setZoom] = useState(null); // "desktop" | "mobile" | null
  const [menuOpen, setMenuOpen] = useState(false);
  const stageRef = useRef(null);

  const product = getProduct(activeTheme);
  const variant = product.presets.find((p) => p.code === selectedCode) || product.presets[0];
  const views = product.views[variant.code] || {};

  const screens = useMemo(
    () => SCREENS.filter((s) => views[s.desktop] || views[s.mobile]),
    [views]
  );
  const screen = screens.find((s) => s.id === screenId) || screens[0];
  const nextScreen = screens[(screens.indexOf(screen) + 1) % screens.length];

  useEffect(() => {
    setScreenId("home");
    setFilter("All");
  }, [activeTheme]);

  const groups = useMemo(() => {
    const buckets = {};
    product.presets.forEach((p) => { (buckets[p.group] ||= []).push(p); });
    return GROUP_ORDER.filter((g) => buckets[g]).map((g) => ({ group: g, items: buckets[g] }));
  }, [product]);

  const visible = useMemo(
    () => groups.filter((g) => filter === "All" || g.group === filter).flatMap((g) => g.items),
    [groups, filter]
  );

  const showPlatform = (id) => {
    setActiveTheme(id);
    stageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const screensOf = (id) => {
    const pr = PRODUCTS[id];
    const v = pr.views[pr.presets[0].code] || {};
    return SCREENS.filter((sc) => v[sc.desktop] || v[sc.mobile]).map((sc) => sc.label);
  };

  const pickFromGrid = (p) => {
    selectVariant(p);
    stageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="site">
      <header className="bar">
        <a className="bar-brand" href="#top" aria-label="AllThemeExch home">
          <img src="/brand-logo.png" alt="" />
          <span>AllThemeExch</span>
        </a>
        <nav className="bar-nav" aria-label="Sections">
          <a href="#platforms">Platforms</a>
          <a href="#designs">Colours</a>
          <a href="#compare">Compare</a>
          <a href="#ordering">How ordering works</a>
        </nav>
        <button type="button" className="btn btn-primary bar-cta" onClick={() => setOrderOpen(true)}>
          Request a design
        </button>
        <button
          type="button"
          className={`menu-btn${menuOpen ? " is-open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <i /><i /><i />
        </button>
      </header>

      {menuOpen && (
        <nav className="menu" aria-label="Sections" onClick={() => setMenuOpen(false)}>
          <a href="#platforms">Platforms</a>
          <a href="#designs">Colours</a>
          <a href="#compare">Compare platforms</a>
          <a href="#ordering">How ordering works</a>
          <button type="button" className="btn btn-primary" onClick={() => setOrderOpen(true)}>
            Request a design
          </button>
        </nav>
      )}

      <main id="top">
        <section className="hero" id="platforms">
          <div className="hero-copy">
            <h1>Your own exchange, in your colours.</h1>
            <p className="hero-lede">
              Choose a platform and a colour. Send us your site name and logo, and we set it up for you.
            </p>

            <h2 className="step-title"><b>1</b>Choose a platform</h2>
            <div className="platforms" role="tablist" aria-label="Platform">
              {THEMES.filter((t) => t.live).map((t) => {
                const active = t.id === activeTheme;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={`platform${active ? " is-active" : ""}`}
                    onClick={() => setActiveTheme(t.id)}
                  >
                    <span className="platform-thumb"><img src={t.cover} alt="" loading="lazy" /></span>
                    <span className="platform-text">
                      <strong>
                        {t.name}
                        {t.isNew && <em className="tag-new">New</em>}
                      </strong>
                      <small>{PRODUCT_COPY[t.id]}</small>
                    </span>
                    {/* Styled like an exchange odds cell: big price, small size */}
                    <span className="cell cell-back" aria-label={`${PRODUCTS[t.id].presets.length} colours`}>
                      <b>{PRODUCTS[t.id].presets.length}</b>
                      <i>colours</i>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="platform-note">{PRODUCT_COPY[activeTheme]}</p>
          </div>

          <div className="hero-show" ref={stageRef}>
            {/* keyed by platform: a new platform starts with an empty stage
                rather than the previous platform's screens */}
            <Stage
              key={activeTheme}
              desktopSrc={views[screen.desktop] || variant.preview}
              mobileSrc={views[screen.mobile]}
              backSrc={nextScreen && nextScreen !== screen ? views[nextScreen.desktop] : null}
              brand={variant.brand}
              label={`${product.name}, ${variant.name}, ${screen.label}`}
              onZoom={setZoom}
            />

            <div className="console">
              <h2 className="step-title"><b>2</b>Choose a colour</h2>

              <div className="swatches" role="radiogroup" aria-label="Colour">
                {product.presets.map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    role="radio"
                    aria-checked={p.code === variant.code}
                    title={`${p.name} (${p.code})`}
                    className={`swatch${p.code === variant.code ? " is-active" : ""}`}
                    style={{ "--sw": p.brand, "--sw2": p.accent || p.brand }}
                    onClick={() => selectVariant(p)}
                  >
                    <i />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>

              <div className="console-row">
                <div className="variant-name">
                  <span className="variant-dot" style={{ background: variant.brand }} />
                  <div>
                    <strong>{product.name} in {variant.name}</strong>
                    <small><span>{variant.code}</span><span>{variant.brand.toUpperCase()}</span></small>
                  </div>
                </div>
                <div className="segmented" role="tablist" aria-label="Screen">
                  {screens.map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      role="tab"
                      aria-selected={sc.id === screen.id}
                      className={sc.id === screen.id ? "is-active" : ""}
                      onClick={() => setScreenId(sc.id)}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="console-actions">
                <button type="button" className="btn btn-primary" onClick={() => setOrderOpen(true)}>
                  Request this design
                </button>
                <button type="button" className="btn btn-quiet" onClick={() => setZoom("desktop")}>
                  View full size
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="designs" id="designs">
          <div className="section-head">
            <h2>All {product.presets.length} {product.name} colours</h2>
            <p>Every card is a real screen of the platform. Pick one to load it in the viewer above.</p>
          </div>

          <div className="chips" role="tablist" aria-label="Filter by colour family">
            <button
              type="button"
              role="tab"
              aria-selected={filter === "All"}
              className={`chip${filter === "All" ? " is-active" : ""}`}
              onClick={() => setFilter("All")}
            >
              All <b>{product.presets.length}</b>
            </button>
            {groups.map(({ group, items }) => (
              <button
                key={group}
                type="button"
                role="tab"
                aria-selected={filter === group}
                className={`chip${filter === group ? " is-active" : ""}`}
                onClick={() => setFilter(group)}
              >
                <i style={{ background: SKY_GROUP_COLOURS[group] }} />
                {group} <b>{items.length}</b>
              </button>
            ))}
          </div>

          <div className="grid">
            {visible.map((p) => {
              const active = p.code === variant.code;
              const phone = product.views[p.code]?.mobileHome;
              return (
                <button
                  key={activeTheme + p.code}
                  type="button"
                  className={`card${active ? " is-active" : ""}`}
                  style={{ "--sw": p.brand }}
                  onClick={() => pickFromGrid(p)}
                  aria-pressed={active}
                >
                  <span className="card-shot">
                    <img src={p.preview} alt={`${product.name} ${p.name}, desktop home`} loading="lazy" />
                    {phone && (
                      <span className="card-phone"><img src={phone} alt="" loading="lazy" /></span>
                    )}
                  </span>
                  <span className="card-foot">
                    <span className="card-sw" />
                    <span className="card-text">
                      <strong>{p.name}</strong>
                      <small><span>{p.code}</span><span>{p.brand.toUpperCase()}</span></small>
                    </span>
                    {active && <span className="card-on">Selected</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="compare" id="compare">
          <div className="section-head">
            <h2>Compare the platforms</h2>
            <p>All three come with desktop and mobile layouts. They differ in look and in how many colours are ready.</p>
          </div>
          <div className="compare-grid">
            {THEMES.filter((t) => t.live).map((t) => {
              const pr = PRODUCTS[t.id];
              const phone = pr.views[pr.presets[0].code]?.mobileHome;
              return (
                <article key={t.id} className={`compare-card${t.id === activeTheme ? " is-active" : ""}`}>
                  <div className="compare-shot">
                    <img src={t.cover} alt={`${t.name} home screen`} loading="lazy" />
                    {phone && <span className="card-phone"><img src={phone} alt="" loading="lazy" /></span>}
                  </div>
                  <h3>{t.name}</h3>
                  <p>{PRODUCT_COPY[t.id]}</p>
                  <dl>
                    <div><dt>Look</dt><dd>{PRODUCT_LOOK[t.id]}</dd></div>
                    <div><dt>Colours</dt><dd>{pr.presets.length}</dd></div>
                    <div><dt>Screens shown</dt><dd>{screensOf(t.id).join(", ")}</dd></div>
                    <div><dt>Layouts</dt><dd>Desktop and mobile</dd></div>
                  </dl>
                  <button type="button" className="btn btn-quiet" onClick={() => showPlatform(t.id)}>
                    {t.id === activeTheme ? "Back to the viewer" : `Show ${t.name}`}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="ordering" id="ordering">
          <div className="section-head">
            <h2>How ordering works</h2>
          </div>
          <ol className="steps">
            <li>
              <strong>Pick a platform and a colour</strong>
              <p>Three platforms, {Object.values(PRODUCTS).reduce((n, p) => n + p.presets.length, 0)} colours between them. Check the home and login screens on desktop and mobile before you choose.</p>
            </li>
            <li>
              <strong>Send your site name and logo</strong>
              <p>Fill in the request form with your name, WhatsApp number and email. The logo can follow later.</p>
            </li>
            <li>
              <strong>We contact you on WhatsApp</strong>
              <p>We reply within 24 hours to confirm the details and set up your site.</p>
            </li>
          </ol>
          <button type="button" className="btn btn-primary" onClick={() => setOrderOpen(true)}>
            Request a design
          </button>
        </section>
      </main>

      <footer className="foot">
        <div className="foot-brand">
          <img src="/brand-logo.png" alt="" />
          <div>
            <strong>AllThemeExch</strong>
            <small>White-label gaming platforms</small>
          </div>
        </div>
        <nav className="foot-nav" aria-label="Footer">
          <a href="#platforms">Platforms</a>
          <a href="#designs">Colours</a>
          <a href="#compare">Compare</a>
          <a href="#ordering">How ordering works</a>
        </nav>
        <p>© {new Date().getFullYear()} allexchtheme. For licensed operators only.</p>
      </footer>

      {/* Mobile: the choice and the action stay within thumb reach */}
      <div className="dock">
        <span className="dock-shot" style={{ "--sw": variant.brand }}>
          <img key={activeTheme} src={views.mobileHome || variant.preview} alt="" />
        </span>
        <div className="dock-text">
          <strong>{product.name}</strong>
          <small>{variant.name}</small>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setOrderOpen(true)}>
          Request this design
        </button>
      </div>

      {zoom && (
        <Lightbox
          kind={zoom}
          setKind={setZoom}
          desktopSrc={views[screen.desktop] || variant.preview}
          mobileSrc={views[screen.mobile]}
          title={`${product.name} in ${variant.name}`}
          screens={screens}
          screenId={screen.id}
          setScreenId={setScreenId}
          onClose={() => setZoom(null)}
        />
      )}

      <OrderModal
        isOpen={orderOpen}
        onClose={() => setOrderOpen(false)}
        productName={product.name}
        variant={variant}
        siteName={config.siteName}
        setSiteName={config.setSiteName}
        logoSrc={config.logoSrc}
        logoFileName={config.logoFileName}
        hasCustomLogo={config.hasCustomLogo}
        logoError={config.logoError}
        uploadLogo={config.uploadLogo}
        removeLogo={config.removeLogo}
      />
    </div>
  );
}
