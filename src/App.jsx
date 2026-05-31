import { useState } from "react";
import DesignPanel from "./components/DesignPanel";
import MainGallery from "./components/MainGallery";
import OrderModal from "./components/OrderModal";
import PreviewOverlay from "./components/PreviewOverlay";
import { useConfig, TIGER_PRESETS } from "./hooks/useConfig";
import "./App.css";

export default function App() {
  const config = useConfig();
  const [orderOpen, setOrderOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);

  const tigerVariantName = TIGER_PRESETS.find(
    (p) => p.brand.toLowerCase() === config.brand?.toLowerCase()
  )?.name;

  const themeProps = {
    siteName: config.siteName,
    logoSrc: config.logoSrc,
    markLogoSrc: config.markLogoSrc,
    hasCustomLogo: config.hasCustomLogo,
    hasCustomMark: config.hasCustomMark,
    logoSize: config.logoSize,
    markSize: config.markSize,
    brand: config.brand,
    activePage: "home",
  };

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-topbar-left">
          <div className="app-mark">A</div>
          <div className="app-title">
            <strong>allexchtheme</strong>
            <small>white-label theme gallery</small>
          </div>
        </div>

        <div className="app-topbar-middle">
          <div className="theme-pill">
            <button
              type="button"
              className={`theme-pill-btn ${config.activeTheme === "sky" ? "active" : ""}`}
              onClick={() => config.setActiveTheme("sky")}
            >
              Sky
            </button>
            <button
              type="button"
              className={`theme-pill-btn ${config.activeTheme === "tiger" ? "active" : ""}`}
              onClick={() => config.setActiveTheme("tiger")}
            >
              Tiger
            </button>
          </div>
        </div>

        <div className="app-topbar-right">
          <button
            type="button"
            className="topbar-icon-btn mobile-settings-btn"
            onClick={() => setMobileSettingsOpen((v) => !v)}
            aria-label="Toggle settings"
          >
            ⚙ <span className="topbar-icon-label">Customize</span>
          </button>
          <button
            type="button"
            className="topbar-ghost"
            onClick={() => setOrderOpen(true)}
          >
            🚀 <span className="topbar-icon-label">Request</span>
          </button>
        </div>
      </header>

      <div className="app-workspace">
        <main className="app-canvas">
          <MainGallery
            activeTheme={config.activeTheme}
            brand={config.brand}
            setBrand={config.setBrand}
            onTigerPreview={() => setPreviewOpen(true)}
          />
        </main>

        <DesignPanel
          {...config}
          onRequestDesign={() => setOrderOpen(true)}
          onOpenTigerPreview={() => setPreviewOpen(true)}
          mobileOpen={mobileSettingsOpen}
          onMobileToggle={() => setMobileSettingsOpen((v) => !v)}
        />
      </div>

      <PreviewOverlay
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        variantName={tigerVariantName}
        themeProps={themeProps}
      />

      <OrderModal
        isOpen={orderOpen}
        onClose={() => setOrderOpen(false)}
        activeTheme={config.activeTheme}
        siteName={config.siteName}
        logoSrc={config.logoSrc}
        brand={config.brand}
      />
    </div>
  );
}
