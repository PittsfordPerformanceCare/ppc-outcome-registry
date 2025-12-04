import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from 'virtual:pwa-register';
import { initMonitoring } from "./lib/monitoring";

// Initialize monitoring (Sentry DSN can be added via env var)
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
initMonitoring(sentryDsn);

// Register service worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

createRoot(document.getElementById("root")!).render(<App />);
