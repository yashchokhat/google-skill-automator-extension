/**
 * background.js — Service Worker (Manifest V3)
 *
 * Responsibilities:
 *  1. Initialize default storage state on install
 *  2. Relay toggle messages between popup and content scripts
 */

// ── Install: set default state ──────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ enabled: false }, () => {
    console.log("[Automator BG] Extension installed — default state: OFF");
  });
});

// ── Message relay ───────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_STATE") {
    const newState = message.enabled;

    chrome.storage.local.set({ enabled: newState }, () => {
      console.log(`[Automator BG] State toggled → ${newState ? "ON" : "OFF"}`);

      // Broadcast to every tab running the content script
      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          chrome.tabs.sendMessage(tab.id, {
            type: "STATE_CHANGED",
            enabled: newState,
          }).catch(() => {
            // Tab may not have the content script — ignore silently
          });
        }
      });

      sendResponse({ success: true, enabled: newState });
    });

    // Return true to indicate async sendResponse
    return true;
  }
});
