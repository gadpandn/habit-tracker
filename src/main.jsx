import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
  // Tell the UI: "update available"
  console.log("🟡 main.js: onNeedRefresh fired");
  window.dispatchEvent(new CustomEvent("pwa:update-available")); 
  },
  onOfflineReady() {
    // Optional: just a nice log
    console.log("🟢 App ready to work offline");
  },
  onRegisterError(error) {
    console.error("❌ SW register error:", error);
  },
});

// Expose a tiny function so the UI can trigger the update
// expose updater
window.__PWA_UPDATE__ = () => {
  console.log("🔵 main.js: updateSW(true) called");
  updateSW(true);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
