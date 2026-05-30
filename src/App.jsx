import { useState } from "react";
import ConfigPanel from "./components/ConfigPanel";
import OrderModal from "./components/OrderModal";
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

  // Both themes load their own Home and Login iframes — the Theme component picks the
  // right URL based on activePage.
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
      <ConfigPanel
        {...config}
        domain={domain}
        setDomain={setDomain}
        domainHistory={domainHistory}
        addDomainHistory={addDomainHistory}
        onRequestDesign={() => setOrderOpen(true)}
      />

      <main className={`preview-pane device-${config.deviceMode}`}>
        {config.activeTheme === "sky" ? (
          <SkyExchangeTheme {...themeProps} />
        ) : (
          <TigerExchTheme {...themeProps} />
        )}
      </main>

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
