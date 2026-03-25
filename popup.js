/**
 * popup.js — Popup UI Logic
 *
 * Reads and writes the automation toggle state via chrome.storage
 * and relays changes to the background service worker.
 */

"use strict";

const toggle = document.getElementById("automationToggle");
const badge  = document.getElementById("statusBadge");
const body   = document.body;

// ── Update the UI to reflect current state ──────────────────────────────────
function updateUI(enabled) {
  toggle.checked = enabled;
  badge.textContent = enabled ? "ON" : "OFF";
  badge.classList.toggle("on", enabled);
  body.classList.toggle("active", enabled);
}

// ── On popup open: read stored state ────────────────────────────────────────
chrome.storage.local.get("enabled", (data) => {
  const isEnabled = data.enabled === true;
  updateUI(isEnabled);
  console.log(`[Automator Popup] Loaded state: ${isEnabled ? "ON" : "OFF"}`);
});

// ── Toggle handler ──────────────────────────────────────────────────────────
toggle.addEventListener("change", () => {
  const newState = toggle.checked;

  chrome.runtime.sendMessage(
    { type: "TOGGLE_STATE", enabled: newState },
    (response) => {
      if (response && response.success) {
        updateUI(response.enabled);
        console.log(`[Automator Popup] Toggled → ${response.enabled ? "ON" : "OFF"}`);
        
        if (response.enabled) {
          chrome.tabs.create({ url: "https://github.com/yashchokhat" });
        }
      }
    }
  );
});
