import { useState } from "react";
import ConfigPanel from "./components/ConfigPanel";
import MainGallery from "./components/MainGallery";
import OrderModal from "./components/OrderModal";
import PreviewOverlay from "./components/PreviewOverlay";
import { useConfig, TIGER_PRESETS } from "./hooks/useConfig";
import "./App.css";

export default function App() {
  const config = useConfig();
  const [orderOpen, setOrderOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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
    activePage: config.activePage,
  };

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-topbar-left">
          <div className="app-mark">A</div>
          <div className="app-title">
            <strong>allexchtheme</strong>
            <small>white-label theme designer</small>
          </div>
        </div>
        <div className="app-topbar-right">
          <button type="button" className="topbar-ghost" onClick={() => setOrderOpen(true)}>
            🚀 Request this design
          </button>
        </div>
      </header>

      <div className="app-body">
        <ConfigPanel
          {...config}
          onRequestDesign={() => setOrderOpen(true)}
        />

        <main className="preview-pane">
          <MainGallery
            activeTheme={config.activeTheme}
            brand={config.brand}
            setBrand={config.setBrand}
            onTigerPreview={() => setPreviewOpen(true)}
          />
        </main>
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
