import { useCallback, useEffect, useState } from "react";

// Brand colour per theme. Defaults match the saved HTML appearance so the app opens
// looking exactly like the original Sky247 and TigerExch pages.
export const SKY_DEFAULT_BRAND = "#474747"; // dark grey — same as the saved Sky header
export const TIGER_DEFAULT_BRAND = "#cc0a00"; // red — same as the saved Tiger nav

// Sky design shop — 20 variants pulled DIRECTLY from the boss's Notion
// gallery via Notion's public API (queryCollection + syncRecordValuesMain).
// Codes (Yl/Bu/Gn/Og/Pl/Rd/Wt) and group labels match Notion 1:1.
// Brand hex is the exact pixel sampled from each variant's desktop header.
//
// Each preset references its own per-variant assets so the swipe carousel
// shows that variant's real mobile + login screenshots (not shared
// fallbacks). For each code there are 6 files in /shop:
//   sky-<code>-desktop.png             home (logged out, desktop)
//   sky-<code>-desktop-login.png       login modal (desktop)
//   sky-<code>-desktop-after-login.png home (logged in, desktop)
//   sky-<code>-mobile.png              home (logged out, mobile)
//   sky-<code>-mobile-login.png        login modal (mobile)
//   sky-<code>-mobile-after-login.png  home (logged in, mobile)
export const SKY_PRESETS = [
  // ── YELLOW ──
  { code: "Yl01", name: "Classic Gold",  brand: "#ffb600", group: "Yellow", preview: "/shop/sky-yl01-desktop.png" },
  { code: "Yl02", name: "Cream",         brand: "#fae6b1", group: "Yellow", preview: "/shop/sky-yl02-desktop.png" },
  { code: "Yl03", name: "Gold Alt",      brand: "#ffb600", group: "Yellow", preview: "/shop/sky-yl03-desktop.png" },

  // ── GREEN ──
  { code: "Gn01", name: "Bright Green",  brand: "#03b44f", group: "Green",  preview: "/shop/sky-gn01-desktop.png" },
  { code: "Gn02", name: "Forest",        brand: "#15805e", group: "Green",  preview: "/shop/sky-gn02-desktop.png" },
  { code: "Gn03", name: "Mint",          brand: "#68c092", group: "Green",  preview: "/shop/sky-gn03-desktop.png" },
  { code: "Gn04", name: "Olive",         brand: "#486f05", group: "Green",  preview: "/shop/sky-gn04-desktop.png" },

  // ── ORANGE ──
  { code: "Og01", name: "Orange",        brand: "#f37335", group: "Orange", preview: "/shop/sky-og01-desktop.png" },
  { code: "Og02", name: "Tomato",        brand: "#f1592a", group: "Orange", preview: "/shop/sky-og02-desktop.png" },

  // ── RED ──
  { code: "Rd01", name: "Dark Red",      brand: "#920000", group: "Red",    preview: "/shop/sky-rd01-desktop.png" },
  { code: "Rd02", name: "Maroon",        brand: "#810000", group: "Red",    preview: "/shop/sky-rd02-desktop.png" },
  { code: "Rd03", name: "Wine",          brand: "#36010b", group: "Red",    preview: "/shop/sky-rd03-desktop.png" },

  // ── BLUE ──
  { code: "Bu01", name: "Royal Blue",    brand: "#005dac", group: "Blue",   preview: "/shop/sky-bu01-desktop.png" },
  { code: "Bu02", name: "Cobalt",        brand: "#005dac", group: "Blue",   preview: "/shop/sky-bu02-desktop.png" },
  { code: "Bu03", name: "Navy",          brand: "#01294b", group: "Blue",   preview: "/shop/sky-bu03-desktop.png" },

  // ── PURPLE ──
  { code: "Pl01", name: "Deep Purple",   brand: "#400078", group: "Purple", preview: "/shop/sky-pl01-desktop.png" },
  { code: "Pl02", name: "Lavender",      brand: "#6a4c93", group: "Purple", preview: "/shop/sky-pl02-desktop.png" },

  // ── WHITE / SILVER ──
  { code: "Wt01", name: "Silver",        brand: "#e4e4e4", group: "White",  preview: "/shop/sky-wt01-desktop.png" },
  { code: "Wt02", name: "Grey",          brand: "#a5a5a5", group: "White",  preview: "/shop/sky-wt02-desktop.png" },
  { code: "Wt03", name: "Pearl",         brand: "#e4e4e4", group: "White",  preview: "/shop/sky-wt03-desktop.png" },
];

// Build the per-variant view set for the swipe carousel (DesignPanel reads this).
// Each variant has 4 "before-login" + 2 "after-login" captures from Notion.
export const SKY_VIEWS = Object.fromEntries(
  SKY_PRESETS.map((p) => {
    const code = p.code.toLowerCase();
    const base = "/shop/sky-" + code;
    return [p.code, {
      desktopHome:        base + "-desktop.png",
      desktopLogin:       base + "-desktop-login.png",
      desktopAfterLogin:  base + "-desktop-after-login.png",
      mobileHome:         base + "-mobile.png",
      mobileLogin:        base + "-mobile-login.png",
      mobileAfterLogin:   base + "-mobile-after-login.png",
    }];
  })
);

// Colour swatch beside each group header (matches the Notion pill tag).
export const SKY_GROUP_COLOURS = {
  Yellow: "#fbbf24",
  Green: "#22c55e",
  Orange: "#f97316",
  Red: "#ef4444",
  Blue: "#3b82f6",
  Purple: "#a855f7",
  White: "#94a3b8",
};

// Shared screenshots reused for every Sky variant's secondary views.
// The boss exported these from the saved HTML — they're the actual mobile/login
// captures and look the same across colour variants (the body content differs,
// the chrome colour is what the variant changes).
// Kept for backward-compatibility — picks Yl01's assets as the fallback set
// if a component still reads from the old name. Real per-variant captures live
// in SKY_VIEWS above (keyed by preset code).
export const SKY_VIEWS_FALLBACK = SKY_VIEWS.Yl01 || {
  desktopHome: "/shop/sky-yl01-desktop.png",
  desktopLogin: "/shop/sky-yl01-desktop-login.png",
  mobileHome: "/shop/sky-yl01-mobile.png",
  mobileLogin: "/shop/sky-yl01-mobile-login.png",
};

// Theme catalog — the product picker scales to any number of entries by reading
// this list. To add a new theme, paste another object below following the same
// shape. Each new theme needs:
//   id        unique slug used by activeTheme state
//   name      display name shown in selector + gallery header
//   tagline   short one-line description
//   category  "Exchange" | "Sportsbook" | "Casino"  (groups themes in selector)
//   cover     URL to /shop/<file>.png used as the card cover image
//   live      true to enable the theme; false greys it out as "Soon"
//
// The selector, gallery, and design panel all read from THEMES so no UI code
// has to change when new themes ship.
export const THEMES = [
  {
    id: "sky",
    name: "Sky Exchange",
    tagline: "Iconic gold + dark exchange UI",
    category: "Exchange",
    cover: "/shop/sky-yl01-desktop.png",
    live: true,
  },
  {
    id: "tiger",
    name: "Tiger Exch",
    tagline: "Materialize-style red exchange",
    category: "Exchange",
    cover: "/shop/sky-rd01-desktop.png",
    live: true,
  },

  // ── More themes go here. Boss will add them when ready. ──
  // Example shape:
  //   {
  //     id: "newbrand",
  //     name: "New Brand",
  //     tagline: "What makes it special",
  //     category: "Exchange",
  //     cover: "/shop/newbrand-cover.png",
  //     live: true,
  //   },
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
