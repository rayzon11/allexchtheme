import { useCallback, useEffect, useState } from "react";

// Brand colour per theme. Defaults match the saved HTML appearance so the app opens
// looking exactly like the original Sky247 and TigerExch pages.
export const SKY_DEFAULT_BRAND = "#474747"; // dark grey — same as the saved Sky header
export const TIGER_DEFAULT_BRAND = "#cc0a00"; // red — same as the saved Tiger nav

// Sky header colour swatches matched to the Notion design palette.
// Each preset only changes the dark .top header gradient; the iconic gold menu
// bar and the rest of the saved Sky247 chrome stay pixel-perfect.
export const SKY_PRESETS = [
  { name: "Original Sky", brand: "#474747" },
  { name: "Charcoal", brand: "#1f2937" },
  { name: "Classic Gold", brand: "#ffb400" },
  { name: "Royal Blue", brand: "#1d4ed8" },
  { name: "Royal Cyan", brand: "#00a8ff" },
  { name: "Emerald", brand: "#1b5e20" },
  { name: "Forest", brand: "#2e7d32" },
  { name: "Maroon", brand: "#7b1f1f" },
  { name: "Crimson", brand: "#c62828" },
  { name: "Coral", brand: "#ef5350" },
  { name: "Sunset", brand: "#ff4500" },
  { name: "Sienna", brand: "#8b4513" },
  { name: "Rose Gold", brand: "#d63384" },
  { name: "Hot Pink", brand: "#ec407a" },
  { name: "Magenta", brand: "#9c27b0" },
  { name: "Deep Purple", brand: "#4a148c" },
  { name: "Indigo", brand: "#283593" },
  { name: "Mint", brand: "#14b8a6" },
  { name: "Olive", brand: "#827717" },
  { name: "Slate", brand: "#475569" },
];

export const TIGER_PRESETS = [
  { name: "Original Tiger", brand: "#cc0a00" },
  { name: "Midnight", brand: "#1a1a2e" },
  { name: "Royal Purple", brand: "#7b1fa2" },
  { name: "Gold", brand: "#b8860b" },
  { name: "Ocean", brand: "#006064" },
  { name: "Forest", brand: "#1b5e20" },
  { name: "Charcoal", brand: "#27272a" },
  { name: "Indigo", brand: "#4338ca" },
  { name: "Coral", brand: "#ff6f61" },
  { name: "Wine", brand: "#7b002c" },
  { name: "Saffron", brand: "#f59e0b" },
  { name: "Teal", brand: "#0d9488" },
];

// Per-theme default logo — auto-applied when nothing is uploaded.
// Sky's original page renders just styled text, so we use a faithful SKY247-style SVG.
// Tiger's original page uses real PNG logos saved in the asset folder.
// Real Sky247 logo from the saved login HTML's asset folder.
export const SKY_DEFAULT_LOGO = "/sky/SKYEXCHANGE%20login_files/logo.png";

export const TIGER_DEFAULT_LOGO = "/tiger/theme%20tiger_files/logo-text.png";
export const TIGER_SIDENAV_LOGO = "/tiger/theme%20tiger_files/Logo1.png";

export const DEFAULT_LOGOS = {
  sky: SKY_DEFAULT_LOGO,
  tiger: TIGER_DEFAULT_LOGO,
};

// Demo logos rendered inline as SVG data URIs — instant apply, no upload.
export const DEMO_LOGOS = [
  {
    name: "Sky247",
    src: SKY_DEFAULT_LOGO,
  },
  {
    name: "Tiger Real",
    src: TIGER_DEFAULT_LOGO,
  },
  {
    name: "Tiger Mark",
    src: TIGER_SIDENAV_LOGO,
  },
  {
    name: "Crown",
    src: "data:image/svg+xml;utf8," + encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 120 40'><rect width='120' height='40' fill='currentColor' opacity='0'/><path d='M14 26 L10 14 L18 19 L26 11 L34 19 L42 14 L38 26 Z' fill='#ffb400' stroke='#000' stroke-width='1'/><text x='48' y='27' font-family='Arial Black,Arial,sans-serif' font-size='17' font-weight='900' fill='#ffffff'>EXCH</text></svg>`
    ),
  },
  {
    name: "Shield",
    src: "data:image/svg+xml;utf8," + encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 120 40'><path d='M22 6 L34 11 L34 22 C34 28 28 34 22 36 C16 34 10 28 10 22 L10 11 Z' fill='#22c55e' stroke='#0a0a0a' stroke-width='1'/><path d='M16 21 L20 25 L28 16' stroke='#fff' stroke-width='2.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/><text x='42' y='27' font-family='Arial Black,Arial,sans-serif' font-size='17' font-weight='900' fill='#ffffff'>BET</text></svg>`
    ),
  },
  {
    name: "Diamond",
    src: "data:image/svg+xml;utf8," + encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 120 40'><path d='M22 6 L34 18 L22 34 L10 18 Z' fill='#00bcd4' stroke='#0a0a0a' stroke-width='1'/><path d='M22 6 L26 18 L22 34 L18 18 Z' fill='#26c6da' opacity='0.5'/><text x='42' y='27' font-family='Arial Black,Arial,sans-serif' font-size='17' font-weight='900' fill='#ffffff'>WIN</text></svg>`
    ),
  },
  {
    name: "Lightning",
    src: "data:image/svg+xml;utf8," + encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 120 40'><path d='M22 4 L12 22 L20 22 L14 36 L30 16 L22 16 Z' fill='#fbbf24' stroke='#000' stroke-width='1'/><text x='38' y='27' font-family='Arial Black,Arial,sans-serif' font-size='17' font-weight='900' fill='#ffffff'>FLASH</text></svg>`
    ),
  },
  {
    name: "Star",
    src: "data:image/svg+xml;utf8," + encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 120 40'><path d='M22 6 L26 17 L37 17 L28 24 L31 35 L22 28 L13 35 L16 24 L7 17 L18 17 Z' fill='#ec4899' stroke='#0a0a0a' stroke-width='1'/><text x='44' y='27' font-family='Arial Black,Arial,sans-serif' font-size='17' font-weight='900' fill='#ffffff'>STAR</text></svg>`
    ),
  },
  {
    name: "Tiger",
    src: "data:image/svg+xml;utf8," + encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 120 40'><circle cx='22' cy='20' r='14' fill='#cc0a00'/><path d='M16 18 L13 14 L17 17 M28 18 L31 14 L27 17' stroke='#0a0a0a' stroke-width='2' fill='none'/><circle cx='18' cy='20' r='2' fill='#000'/><circle cx='26' cy='20' r='2' fill='#000'/><path d='M19 25 Q22 27 25 25' stroke='#000' stroke-width='1.5' fill='none'/><text x='42' y='27' font-family='Arial Black,Arial,sans-serif' font-size='17' font-weight='900' fill='#ffffff'>TIGER</text></svg>`
    ),
  },
];

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

// 4-digit captcha used by Sky's header overlay and the LoginPage view.
export function randomCaptcha() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// Shared image style for any logo slot. Pass the height; width auto + objectFit:contain
// preserve aspect ratio. Used by header, sidenav, footer, and login card.
export function logoImgStyle(height = 36, maxWidth = 220) {
  return { height, maxWidth, width: "auto", objectFit: "contain", display: "block" };
}

export function isValidHex(v) {
  return typeof v === "string" && HEX_RE.test(v);
}

export function normaliseHex(v) {
  if (!isValidHex(v)) return v;
  if (v.length === 4) {
    const r = v[1], g = v[2], b = v[3];
    return ("#" + r + r + g + g + b + b).toLowerCase();
  }
  return v.toLowerCase();
}

// Darken a hex by a given amount (0-1).
export function darken(hex, amt = 0.3) {
  if (!isValidHex(hex)) return hex;
  const norm = normaliseHex(hex);
  const r = parseInt(norm.slice(1, 3), 16);
  const g = parseInt(norm.slice(3, 5), 16);
  const b = parseInt(norm.slice(5, 7), 16);
  const d = (c) => Math.max(0, Math.min(255, Math.round(c * (1 - amt))));
  return "#" + [d(r), d(g), d(b)].map((c) => c.toString(16).padStart(2, "0")).join("");
}

// Decide whether to use light or dark text on top of a brand colour.
export function contrastText(hex) {
  if (!isValidHex(hex)) return "#fff";
  const norm = normaliseHex(hex);
  const r = parseInt(norm.slice(1, 3), 16);
  const g = parseInt(norm.slice(3, 5), 16);
  const b = parseInt(norm.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#111" : "#fff";
}

const ACCEPTED_MIME = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAX_LOGO_BYTES = 5 * 1024 * 1024;

/**
 * Pick a sensible default display height for an image based on its natural aspect
 * ratio. Wide marks need less height to read well; tall/square marks need more so
 * they don't look cramped in their slot.
 *
 *   slot: "header" → 30–56px range
 *   slot: "mark"   → 44–96px range
 */
function recommendSize(src, slot, cb) {
  if (!src) return;
  const img = new Image();
  img.onload = () => {
    const w = img.naturalWidth || 1;
    const h = img.naturalHeight || 1;
    const ratio = w / h;
    let px;
    if (slot === "header") {
      px = ratio > 5 ? 44 : ratio > 3 ? 40 : ratio > 1.5 ? 38 : ratio > 0.8 ? 44 : 52;
    } else {
      px = ratio > 4 ? 52 : ratio > 2 ? 60 : ratio > 1.2 ? 72 : ratio > 0.8 ? 80 : 88;
    }
    cb(px);
  };
  img.onerror = () => cb(slot === "header" ? 36 : 64);
  img.src = src;
}

export function useConfig() {
  const [activeTheme, setActiveThemeState] = useState("sky");
  // The two pages a customer sees when visiting a white-label site:
  // "home" = lobby (iframe of the saved HTML)
  // "login" = brand-coloured login form
  const [activePage, setActivePage] = useState("home");
  // Preview device frame. "desktop" = iframe fills the preview pane;
  // "mobile" = iframe is constrained to a 400px phone-frame, triggering the saved
  // HTMLs' own mobile media queries.
  const [deviceMode, setDeviceMode] = useState("desktop");
  const [siteNamesByTheme, setSiteNamesByTheme] = useState({
    sky: "SKYEXCHANGE",
    tiger: "TIGEREXCH",
  });
  const [brandByTheme, setBrandByTheme] = useState({
    sky: SKY_DEFAULT_BRAND,
    tiger: TIGER_DEFAULT_BRAND,
  });
  // Per-theme custom logos. `primary` = the main text/header logo. `mark` = the graphical
  // icon used in the Tiger sidenav (and as a secondary mark elsewhere). `null` falls back
  // to the theme's built-in default (real Sky247 PNG / real Tiger PNGs).
  const [customLogoByTheme, setCustomLogoByTheme] = useState({ sky: null, tiger: null });
  const [customMarkByTheme, setCustomMarkByTheme] = useState({ sky: null, tiger: null });
  const [logoFileNameByTheme, setLogoFileNameByTheme] = useState({ sky: "", tiger: "" });
  const [markFileNameByTheme, setMarkFileNameByTheme] = useState({ sky: "", tiger: "" });
  const [logoError, setLogoError] = useState("");
  const [markError, setMarkError] = useState("");
  // Per-theme display height (px) for each logo slot. 100% = native size.
  const [logoSizeByTheme, setLogoSizeByTheme] = useState({ sky: 36, tiger: 32 });
  const [markSizeByTheme, setMarkSizeByTheme] = useState({ sky: 36, tiger: 64 });

  // Resolved logos for the active theme.
  const customLogo = customLogoByTheme[activeTheme];
  const customMark = customMarkByTheme[activeTheme];
  const logoSrc = customLogo || DEFAULT_LOGOS[activeTheme] || null;
  const markLogoSrc = customMark || (activeTheme === "tiger" ? TIGER_SIDENAV_LOGO : null) || logoSrc;
  const logoFileName = logoFileNameByTheme[activeTheme] || (customLogo ? "" : "Default");
  const markFileName = markFileNameByTheme[activeTheme] || (customMark ? "" : "Default");
  const hasCustomLogo = !!customLogo;
  const hasCustomMark = !!customMark;
  const logoSize = logoSizeByTheme[activeTheme];
  const markSize = markSizeByTheme[activeTheme];
  const setLogoSize = useCallback((px) => {
    setLogoSizeByTheme((prev) => ({ ...prev, [activeTheme]: px }));
  }, [activeTheme]);
  const setMarkSize = useCallback((px) => {
    setMarkSizeByTheme((prev) => ({ ...prev, [activeTheme]: px }));
  }, [activeTheme]);

  const siteName = siteNamesByTheme[activeTheme];
  const brand = brandByTheme[activeTheme];

  useEffect(() => {
    document.title = siteName || "White Label Configurator";
  }, [siteName]);

  // Push brand colour to a single CSS variable.
  useEffect(() => {
    document.documentElement.style.setProperty("--brand", brand);
    document.documentElement.style.setProperty("--brand-dark", darken(brand, 0.35));
    document.documentElement.style.setProperty("--brand-text", contrastText(brand));
  }, [brand]);

  const setActiveTheme = useCallback((theme) => {
    setActiveThemeState(theme);
  }, []);

  const setSiteName = useCallback((name) => {
    const trimmed = (name || "").slice(0, 20);
    setSiteNamesByTheme((prev) => ({ ...prev, [activeTheme]: trimmed }));
  }, [activeTheme]);

  const setBrand = useCallback((hex) => {
    if (!isValidHex(hex)) return;
    const norm = normaliseHex(hex);
    setBrandByTheme((prev) => ({ ...prev, [activeTheme]: norm }));
  }, [activeTheme]);

  const resetBrand = useCallback(() => {
    setBrandByTheme((prev) => ({
      ...prev,
      [activeTheme]: activeTheme === "sky" ? SKY_DEFAULT_BRAND : TIGER_DEFAULT_BRAND,
    }));
  }, [activeTheme]);

  // Shared upload pipeline for either slot. After the data URI is ready, auto-detect
  // a good display size from the image's natural aspect ratio so freshly-uploaded logos
  // don't inherit a wrong size from a previous upload.
  const makeUpload = (setSlot, setName, setErr, setSizePerTheme, sizeSlot) => (file) => {
    setErr("");
    if (!file) return;
    if (!ACCEPTED_MIME.includes(file.type)) {
      setErr("Invalid file type. Use PNG, JPEG, SVG or WebP.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setErr("File too large. Maximum 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      setSlot((prev) => ({ ...prev, [activeTheme]: src }));
      setName((prev) => ({ ...prev, [activeTheme]: file.name }));
      setErr("");
      recommendSize(src, sizeSlot, (px) => {
        setSizePerTheme((prev) => ({ ...prev, [activeTheme]: px }));
      });
    };
    reader.onerror = () => setErr("Failed to read file.");
    reader.readAsDataURL(file);
  };

  const uploadLogo = useCallback(
    makeUpload(setCustomLogoByTheme, setLogoFileNameByTheme, setLogoError, setLogoSizeByTheme, "header"),
    [activeTheme]
  );
  const uploadMark = useCallback(
    makeUpload(setCustomMarkByTheme, setMarkFileNameByTheme, setMarkError, setMarkSizeByTheme, "mark"),
    [activeTheme]
  );

  const removeLogo = useCallback(() => {
    setCustomLogoByTheme((prev) => ({ ...prev, [activeTheme]: null }));
    setLogoFileNameByTheme((prev) => ({ ...prev, [activeTheme]: "" }));
    setLogoError("");
  }, [activeTheme]);

  const removeMark = useCallback(() => {
    setCustomMarkByTheme((prev) => ({ ...prev, [activeTheme]: null }));
    setMarkFileNameByTheme((prev) => ({ ...prev, [activeTheme]: "" }));
    setMarkError("");
  }, [activeTheme]);

  // Apply a demo logo (already a URL/data URI, no FileReader needed). Auto-fit size.
  const applyDemoLogo = useCallback((demo) => {
    if (!demo || !demo.src) return;
    setCustomLogoByTheme((prev) => ({ ...prev, [activeTheme]: demo.src }));
    setLogoFileNameByTheme((prev) => ({ ...prev, [activeTheme]: `${demo.name}` }));
    setLogoError("");
    recommendSize(demo.src, "header", (px) => {
      setLogoSizeByTheme((prev) => ({ ...prev, [activeTheme]: px }));
    });
  }, [activeTheme]);

  return {
    activeTheme,
    setActiveTheme,
    activePage,
    setActivePage,
    deviceMode,
    setDeviceMode,
    siteName,
    setSiteName,
    brand,
    setBrand,
    resetBrand,
    logoSrc,
    logoFileName,
    hasCustomLogo,
    logoError,
    uploadLogo,
    removeLogo,
    applyDemoLogo,
    markLogoSrc,
    markFileName,
    hasCustomMark,
    markError,
    uploadMark,
    removeMark,
    logoSize,
    markSize,
    setLogoSize,
    setMarkSize,
  };
}
