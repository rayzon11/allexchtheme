import { useEffect, useState } from "react";
import { isValidHex, normaliseHex } from "../hooks/useConfig";

export default function ColourRow({ label, value, onChange }) {
  const [draft, setDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setDraft(value);
    setInvalid(false);
  }, [value]);

  const handleHexTyping = (e) => {
    let next = e.target.value;
    if (!next.startsWith("#")) next = "#" + next;
    setDraft(next);
    if (isValidHex(next)) {
      setInvalid(false);
      onChange(normaliseHex(next));
    } else {
      setInvalid(true);
    }
  };

  const handlePicker = (e) => {
    const next = e.target.value;
    setDraft(next);
    setInvalid(false);
    onChange(next);
  };

  return (
    <div className="colour-row">
      <span className="colour-row-label">{label}</span>
      <label className="colour-swatch" style={{ background: value }}>
        <input type="color" value={value} onChange={handlePicker} />
      </label>
      <input
        type="text"
        className={`hex-input${invalid ? " invalid" : ""}`}
        value={draft.toUpperCase()}
        onChange={handleHexTyping}
        maxLength={7}
        spellCheck={false}
      />
    </div>
  );
}
