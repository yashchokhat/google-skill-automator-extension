<div align="center">

# ⚡ Learning Platform Automator

**A relentless, hyper-fast Chrome Extension that automatically skips videos, blitzes through labs, and auto-clicks through your online courses.** <br>
*Specially tailored for maximum speed on Google Cloud Skills Boost.*

**Developed by [YASH P. CHOKHAT](https://github.com/yashchokhat) | [LinkedIn](https://www.linkedin.com/in/y%C4%81sh/)**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](#)
[![Google Cloud Skills Boost](https://img.shields.io/badge/Supports-Google_Skills-success.svg)](#)
[![Coursera & Udemy](https://img.shields.io/badge/Supports-Coursera_&_Udemy-success.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)


</div>

---

## 🚀 Features & Superpowers

This extension is built for **speed**. It uses advanced browser manipulation to instantly complete coursework, bypassing the safety mechanisms that normal extensions trigger.

### 🌟 Core Capabilities
- **Direct YouTube Override**: Injects native `postMessage` commands to bypass cross-origin iframe restrictions and instantly force videos to `99999` seconds.
- **Shadow DOM Penetration**: Standard DOM queries can't see Google's web components. This extension recursively drills through all `ShadowRoot` boundaries to hunt down hidden "Next Activity" buttons.
- **Auto-Clicker**: Automatically clicks "Next", "Continue", "Submit", and "Got It".
- **Auto-Scroll**: Triggers lazy-loaded content by scrolling gracefully to the bottom.
- **Checkbox Ticker**: Seeks out any unchecked `<input type="checkbox">` and forces a tick.

### ⚡ The "Google Skills" Fast Track
When you visit `skills.google.com` or `cloudskillsboost.google`, the extension shifts into **Overdrive Mode**:
1. Scan interval drops to `1000ms`.
2. Any page with `/labs/`, `/quizzes/`, or `/assessments/` in the URL instantly gets skipped by forcefully clicking "Next".
3. The video player overlay buttons (`Next activity`, `Mark as completed`) are instantly identified and clicked.

---

## 🎨 User Interface

The extension features a **dark, glassmorphic popup UI** built for modern aesthetics:
- **Toggle Switch**: A smooth cyan-accented toggle to switch automation `ON`/`OFF`.
- **Status Indicator**: Dynamic glowing badge showing the current state.
- **GitHub Redirection**: Flipping the switch to `ON` instantly opens a new tab to [Yash's GitHub](https://github.com/yashchokhat) to credit the developer and share future updates.
- **Developer Banner**: A large gradient banner to show appreciation to the author.

---

## 🛠️ Installation Guide

1. Clone or download this repository to a folder on your machine.
2. Open Google Chrome and go to `chrome://extensions/`
3. Turn on **Developer mode** in the top right corner.
4. Click **Load unpacked** in the top left.
5. Select the folder containing these files.
6. The ⚡ icon will appear in your Chrome toolbar. Pin it!

> **Note**: Chrome may warn you that this extension "Can read and change all your data on the websites you visit" because of the `<all_urls>` permission. This is **required** to allow the Automator to bypass Youtube constraints and Shadow DOM networks!

---

## 💻 How It Works (Under the Hood)

| File | Responsibilities |
| :--- | :--- |
| **`manifest.json`** | Uses V3 structure, injects script into all frames (`"all_frames": true`) matching `<all_urls>` to defeat iframe boundaries. |
| **`background.js`** | The Service Worker that maintains the `ON/OFF` state across the browser via `chrome.storage.local`. |
| **`content.js`** | The engine. Employs `TreeWalker` API for deep DOM traversal, `postMessage` for video hacking, and random delays (200-600ms) to bypass bot-detection algorithms. |
| **`popup.js` / `popup.html`** | State handlers and aesthetics for the visual menu. Includes auto-redirect to GitHub logic. |

---

## 🗂️ Project Structure

```text
learning-automator-extension/
├── manifest.json      # Complete Manifest V3 configuration & permissions
├── background.js      # Service Worker (State sync master)
├── content.js         # The Engine (DOM traversal, native overrides, heuristics)
├── popup.html         # Premium glassmorphic UI structure
├── popup.js           # Interactive UI logic & browser tab bridging
├── styles.css         # UI Styling and animations
└── icons/             # 16, 48, and 128px high-res lightning bolt icons
```

---

## 🌐 Supported Platforms

While explicitly optimized for **Google Cloud Skills Boost**, the automator works automatically across:
- Google Cloud Skills (`skills.google`)
- Coursera (`coursera.org`)
- Udemy (`udemy.com`)
- edX (`edx.org`)
- LinkedIn Learning (`linkedin.com/learning`)
- Google Skillshop (`skillshop.exceedlms.com`)
- Pluralsight (`pluralsight.com`)
- And almost any site relying on standard HTML5 or YouTube-embedded video!

---

<div align="center">

*This project is built for educational & fast-tracking purposes.* <br>
**A Masterpiece by [Yash P. Chokhat](https://github.com/yashchokhat) • [Connect on LinkedIn](https://www.linkedin.com/in/y%C4%81sh/)**

</div>
