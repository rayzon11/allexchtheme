import { useState } from "react";
import ConfigPanel from "./components/ConfigPanel";
import OrderModal from "./components/OrderModal";
import SkyScreenshotPreview from "./components/SkyScreenshotPreview";
import SkyExchangeTheme from "./components/themes/SkyExchangeTheme";
import TigerExchTheme from "./components/themes/TigerExchTheme";
import { useConfig } from "./hooks/useConfig";
import "./App.css";

export default function App() {
  const config = useConfig();
  const [orderOpen, setOrderOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [domainHistory, setDomainHistory] = useState([]);

  const addDomainHistory = (entry) => {
    setDomainHistory((prev) => {
      const filtered = prev.filter((p) => p.domain !== entry.domain);
      return [entry, ...filtered].slice(0, 8);
    });
  };

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

  // Sky home view: show the selected variant's saved screenshot, not the iframe.
  // Sky login + Tiger (both pages): use the iframe so brand + logo customizations
  // still flow through.
  const showSkyScreenshot = config.activeTheme === "sky" && config.activePage === "home";

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
          domain={domain}
          setDomain={setDomain}
          domainHistory={domainHistory}
          addDomainHistory={addDomainHistory}
          onRequestDesign={() => setOrderOpen(true)}
        />

        <main className={`preview-pane device-${config.deviceMode}`}>
          {showSkyScreenshot ? (
            <SkyScreenshotPreview
              brand={config.brand}
              deviceMode={config.deviceMode}
              siteName={config.siteName}
            />
          ) : config.activeTheme === "sky" ? (
            <SkyExchangeTheme {...themeProps} />
          ) : (
            <TigerExchTheme {...themeProps} />
          )}
        </main>
      </div>

      <OrderModal
        isOpen={orderOpen}
        onClose={() => setOrderOpen(false)}
        activeTheme={config.activeTheme}
        activePage={config.activePage}
        siteName={config.siteName}
        logoSrc={config.logoSrc}
        brand={config.brand}
        domain={domain}
      />
    </div>
  );
}
