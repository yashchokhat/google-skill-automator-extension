/**
 * content.js — Learning Platform Automator
 *
 * Injected on supported domains. Runs automation in a safe, non-blocking loop
 * with random delays to avoid detection.
 *
 * Modules:
 *  1. Video Controller   — speed, mute, skip
 *  2. Button Clicker     — auto-click common navigation buttons
 *  3. Checkbox Ticker    — tick unchecked boxes
 *  4. Page Scroller      — scroll down to trigger lazy loading
 */

"use strict";

// ── Configuration ───────────────────────────────────────────────────────────
const CONFIG = {
  LOOP_INTERVAL_MS: 1500,       // Base interval between automation cycles (faster)
  RANDOM_DELAY_MIN: 200,        // Min random delay before actions (ms)
  RANDOM_DELAY_MAX: 600,        // Max random delay before actions (ms)
  SCROLL_STEP_PX: 800,          // Pixels per scroll step
  SCROLL_DELAY_MS: 200,         // Delay between scroll steps
  MAX_PLAYBACK_RATE: 16,        // Maximum video playback speed
  BUTTON_KEYWORDS: [
    "next", "continue", "start", "submit", "ok", "got it",
    "mark as completed", "resume", "proceed", "confirm",
    "i agree", "accept", "done", "finish", "complete",
    "enroll", "start learning", "go to next", "skip",
    "check my progress", "run", "end lab", "next activity"
  ],
};

// ── State ───────────────────────────────────────────────────────────────────
let automationEnabled = false;
let loopTimer = null;

// ── Utility helpers ─────────────────────────────────────────────────────────

/** Returns a random integer between min and max (inclusive). */
function randomDelay(min = CONFIG.RANDOM_DELAY_MIN, max = CONFIG.RANDOM_DELAY_MAX) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Waits for a given number of milliseconds. */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Safely log with a prefix. */
function log(msg, ...args) {
  console.log(`%c[Automator]%c ${msg}`, "color:#00e5ff;font-weight:bold", "color:inherit", ...args);
}

/** Recursively find elements including inside Shadow DOMs */
function getAllElements(selector, root = document) {
  let results = Array.from(root.querySelectorAll(selector));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
  let node;
  while ((node = walker.nextNode())) {
    if (node.shadowRoot) {
      results = results.concat(getAllElements(selector, node.shadowRoot));
    }
  }
  return results;
}

// ── 1. Video Controller ─────────────────────────────────────────────────────

function controlVideos() {
  const videos = getAllElements("video");
  if (videos.length === 0) return;

  videos.forEach((video, i) => {
    try {
      // Set maximum playback rate
      if (video.playbackRate !== CONFIG.MAX_PLAYBACK_RATE) {
        video.playbackRate = CONFIG.MAX_PLAYBACK_RATE;
        log(`Video #${i} → playback rate set to ${CONFIG.MAX_PLAYBACK_RATE}x`);
      }

      // Mute
      if (!video.muted) {
        video.muted = true;
        log(`Video #${i} → muted`);
      }

      // Skip directly to the end
      if (video.duration && isFinite(video.duration) && video.currentTime < video.duration - 0.5) {
        // Many platforms (including YouTube and Google Skills) require the video to actually finish
        // Setting to duration exactly sometimes prevents the 'ended' event, so we get extremely close.
        video.currentTime = video.duration - 0.1;
        log(`Video #${i} → skipped to end (${video.duration.toFixed(1)}s)`);
      }

      // Auto-play if paused
      if (video.paused) {
        video.play().catch(() => {});
        log(`Video #${i} → auto-played`);
      }
    } catch (err) {
      log(`Video #${i} error:`, err);
    }
  });
}

// ── 2. Button Clicker ───────────────────────────────────────────────────────

function getClickableElements() {
  const selectors = "button, a, [role='button'], input[type='submit'], input[type='button'], .btn, .cta-button";
  return getAllElements(selectors);
}

function isExternalSafetyHazard(el) {
  if (el.tagName && el.tagName.toUpperCase() === "A" && el.href) {
    try {
      const url = new URL(el.href);
      // If the link goes to notebookLM, google support, etc., abort!
      if (
        url.hostname.includes("notebooklm") ||
        url.hostname.includes("support.google") ||
        url.hostname.includes("accounts.google") ||
        url.hostname.includes("workspace.google")
      ) {
        return true;
      }
    } catch (e) {}
  }
  return false;
}

function matchesKeyword(element) {
  if (isExternalSafetyHazard(element)) return false;

  const text = (
    element.innerText || 
    element.textContent || 
    element.value || 
    element.getAttribute("aria-label") || 
    element.getAttribute("title") || 
    element.getAttribute("label") || 
    ""
  ).trim().toLowerCase();

  return CONFIG.BUTTON_KEYWORDS.some((kw) => text.includes(kw));
}

function isVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    el.offsetParent !== null
  );
}

async function clickButtons() {
  const elements = getClickableElements().filter((el) => matchesKeyword(el) && isVisible(el) && !el.disabled);

  for (const el of elements) {
    await sleep(randomDelay());
    try {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.click();
      log(`Clicked → "${(el.textContent || el.value || "").trim().substring(0, 40)}"`);
    } catch (err) {
      log("Click error:", err);
    }
  }
}

// ── 3. Checkbox Ticker ──────────────────────────────────────────────────────

async function tickCheckboxes() {
  const checkboxes = getAllElements('input[type="checkbox"]:not(:checked)');
  if (checkboxes.length === 0) return;

  for (const cb of checkboxes) {
    if (!isVisible(cb)) continue;
    await sleep(randomDelay(300, 900));
    try {
      cb.checked = true;
      cb.dispatchEvent(new Event("change", { bubbles: true }));
      cb.dispatchEvent(new Event("input", { bubbles: true }));
      // Also click — some frameworks need a real click
      cb.click();
      log("Checkbox ticked");
    } catch (err) {
      log("Checkbox error:", err);
    }
  }
}

// ── 4. Page Scroller ────────────────────────────────────────────────────────

async function autoScroll() {
  const scrollHeight = document.documentElement.scrollHeight;
  const currentScroll = window.scrollY + window.innerHeight;

  // Only scroll if there is more content below
  if (currentScroll < scrollHeight - 100) {
    window.scrollBy({ top: CONFIG.SCROLL_STEP_PX, behavior: "smooth" });
    log(`Scrolled ↓ ${CONFIG.SCROLL_STEP_PX}px`);
    await sleep(CONFIG.SCROLL_DELAY_MS);
  }
}

// ── Main automation loop ────────────────────────────────────────────────────

async function runAutomation() {
  if (!automationEnabled) return;
  log("── Automation cycle running ──");

  try {
    controlVideos();
    await sleep(randomDelay(200, 600));

    await clickButtons();
    await sleep(randomDelay(200, 600));

    await tickCheckboxes();
    await sleep(randomDelay(200, 600));

    await autoScroll();
  } catch (err) {
    log("Cycle error:", err);
  }
}

// ── 5. Domain Specific Hacks (Google Skills) ────────────────────────────────

function googleSkillsSpecificHacks() {
  if (!window.location.hostname.includes("skills.google")) return;

  // 1. Force YouTube iframes to end instantly using native API (bypassing cross-origin limits)
  const iframes = getAllElements("iframe");
  for (const iframe of iframes) {
    if (iframe.src && iframe.src.includes("youtube")) {
      iframe.contentWindow.postMessage('{"event":"command","func":"seekTo","args":[999999, true]}', "*");
      iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', "*");
      iframe.contentWindow.postMessage('{"event":"command","func":"setPlaybackRate","args":[2]}', "*");
    }
  }

  // 2. Extremely aggressive, instant click for Next Activity and Mark as Completed Overlays
  const buttons = getAllElements("button, a, [role='button'], mwc-button, .mdc-button, .gemini-button");
  for (const btn of buttons) {
    const text = (
      btn.innerText || 
      btn.textContent || 
      btn.getAttribute("label") || 
      btn.getAttribute("title") || 
      ""
    ).toLowerCase().trim();

    if (text === "next activity" || text === "mark as completed" || text === "next" || text === "next >" || text.includes("next activity")) {
      log(`⚡ Google Skills Fast-Track: Clicking "${text}" instantly`);
      btn.click();
      if (btn.parentElement) btn.parentElement.click(); // Backup click for web components
    }
  }

  // 3. Labs and MCQs auto-skip
  if (window.location.href.includes("/labs/") || window.location.href.includes("/quizzes/") || window.location.href.includes("/assessments/")) {
    log("⚡ Skipping Lab/MCQ...");
    const nextBtn = buttons.find(b => {
      const t = (b.innerText || b.textContent || "").toLowerCase().trim();
      return (t.includes("next") || t.includes("skip")) && !t.includes("previous");
    });
    
    if (nextBtn) {
      nextBtn.click();
      if (nextBtn.parentElement) nextBtn.parentElement.click();
    }
  }
}

// ── Main automation loop ────────────────────────────────────────────────────

async function runAutomation() {
  if (!automationEnabled) return;
  log("── Automation cycle running ──");

  // Run aggressive Google Skills fast-track instantly
  if (window.location.hostname.includes("skills.google")) {
    googleSkillsSpecificHacks();
  }

  try {
    controlVideos();
    await sleep(randomDelay(200, 600));

    await clickButtons();
    await sleep(randomDelay(200, 600));

    await tickCheckboxes();
    await sleep(randomDelay(200, 600));

    await autoScroll();
  } catch (err) {
    log("Cycle error:", err);
  }
}

function startLoop() {
  if (loopTimer) return; // Already running
  log("🟢 Automation STARTED");
  runAutomation(); // Run immediately
  
  // For skills.google run even faster (every 1 second)
  const interval = window.location.hostname.includes("skills.google") ? 1000 : CONFIG.LOOP_INTERVAL_MS + randomDelay(0, 1000);
  loopTimer = setInterval(runAutomation, interval);
}

function stopLoop() {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
  log("🔴 Automation STOPPED");
}

// ── 6. Auto-Pause when navigating away ──────────────────────────────────────

let pauseOverlay = null;

document.addEventListener("visibilitychange", () => {
  if (!automationEnabled || !window.location.hostname.includes("skills.google")) return;
  
  if (document.hidden) {
    log("Tab hidden → Pausing automation");
    stopLoop();
    
    if (window === window.top) { // Only put UI on main frame, not iframes
      pauseOverlay = document.createElement("div");
      pauseOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(10, 22, 40, 0.9); backdrop-filter: blur(8px);
        z-index: 2147483647; display: flex; flex-direction: column;
        justify-content: center; align-items: center; color: #fff;
        font-family: system-ui, sans-serif; transition: opacity 0.3s;
      `;
      pauseOverlay.innerHTML = `
        <div style="font-size: 72px; margin-bottom: 20px;">⏸️</div>
        <h1 style="font-size: 40px; margin: 0 0 10px 0; background: linear-gradient(90deg, #00e5ff, #7c4dff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Automation Paused</h1>
        <p style="font-size: 18px; color: #a4b2c6;">You navigated away from this tab. Come back to resume!</p>
      `;
      document.body.appendChild(pauseOverlay);
    }
  } else {
    log("Tab visible → Resuming automation");
    if (pauseOverlay) {
      pauseOverlay.remove();
      pauseOverlay = null;
    }
    startLoop();
  }
});

// ── State management ────────────────────────────────────────────────────────

// Listen for state changes from the background service worker
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "STATE_CHANGED") {
    automationEnabled = message.enabled;
    message.enabled ? startLoop() : stopLoop();
  }
});

// On load: check stored state and start if enabled
chrome.storage.local.get("enabled", (data) => {
  automationEnabled = data.enabled === true;
  if (automationEnabled) {
    // Small delay to let the page finish rendering
    setTimeout(startLoop, 2000);
  }
  log(`Initial state: ${automationEnabled ? "ON" : "OFF"}`);
});
