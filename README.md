# ⚡ Learning Platform Automator — Chrome Extension

A Chrome Extension (Manifest V3) that automates video-based online courses by controlling playback, auto-clicking navigation buttons, completing checkboxes, and scrolling pages.

---

## 📦 Installation

1. **Download / Clone** this folder to your computer
2. Open **Google Chrome** and navigate to `chrome://extensions/`
3. Enable **Developer Mode** (toggle in the top-right corner)
4. Click **"Load unpacked"**
5. Select the `learning-automator-extension` folder
6. The ⚡ icon appears in your toolbar — click it to toggle ON/OFF

---

## 🗂️ File Structure

```
learning-automator-extension/
├── manifest.json      # Extension config (Manifest V3)
├── background.js      # Service worker — state management
├── content.js         # Injected automation script
├── popup.html         # Toggle UI markup
├── popup.js           # Toggle UI logic
├── styles.css         # Popup styling
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## 📄 File Explanations

### `manifest.json`
Defines the extension's metadata, permissions, and structure:
- **Manifest V3** — uses `service_worker` (no legacy background page)
- **Permissions**: `storage` (persist ON/OFF state), `activeTab`
- **Content Script**: injected on supported learning platforms at `document_idle`
- **No external scripts** — fully self-contained

### `background.js` (Service Worker)
- Sets default state (`enabled: false`) on first install
- Listens for toggle messages from the popup
- Broadcasts state changes to all tabs running the content script
- Runs as an event-driven service worker (no persistent background page)

### `content.js` (Content Script)
The core automation engine with **4 modular functions**:

| Module | What it does |
|---|---|
| `controlVideos()` | Finds `<video>` elements → sets speed to 16×, mutes, skips to end |
| `clickButtons()` | Matches buttons by text (Next, Continue, Submit, etc.) → clicks with random delay |
| `tickCheckboxes()` | Finds unchecked checkboxes → ticks them, dispatches change events |
| `autoScroll()` | Scrolls down in increments to trigger lazy-loaded content |

**Safety features:**
- Random delays (0.8–2.5 s) between actions to avoid detection
- Only clicks visible, enabled buttons
- Console logs every action for debugging
- Non-blocking async loop

### `popup.html` + `popup.js` + `styles.css`
A dark-themed popup UI with:
- ON/OFF toggle switch with animated slider
- Status badge that changes color (red = OFF, cyan = ON)
- Feature summary showing what the extension does
- State persisted via `chrome.storage.local`

---

## 🌐 Supported Platforms

| Platform | Domain |
|---|---|
| Google Cloud Skills Boost | `cloudskillsboost.google`, `skills.google` |
| Coursera | `coursera.org` |
| Udemy | `udemy.com` |
| edX | `edx.org` |
| LinkedIn Learning | `linkedin.com/learning` |
| Google Skillshop | `skillshop.exceedlms.com` |
| Pluralsight | `pluralsight.com` |

> To add more domains, edit the `matches` array in `manifest.json`.

---

## 🔧 Configuration

Edit the `CONFIG` object at the top of `content.js`:

```js
const CONFIG = {
  LOOP_INTERVAL_MS: 3000,       // Base interval between cycles
  RANDOM_DELAY_MIN: 800,        // Min random delay (ms)
  RANDOM_DELAY_MAX: 2500,       // Max random delay (ms)
  SCROLL_STEP_PX: 600,          // Pixels per scroll step
  MAX_PLAYBACK_RATE: 16,        // Video speed multiplier
  BUTTON_KEYWORDS: [ ... ],     // Button text patterns to auto-click
};
```

---

## 🐛 Debugging

1. Open the website → Press `F12` → Console tab
2. Look for `[Automator]` prefixed logs in cyan
3. For background logs: `chrome://extensions/` → click **"service worker"** link under the extension

---

## ⚠️ Disclaimer

This extension is for **educational and personal productivity** purposes only. Use responsibly and in accordance with each platform's Terms of Service.
