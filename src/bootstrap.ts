/**
 * Bootstrap script - Polyfill + Font Loading
 * This runs BEFORE the main content script
 */

// Polyfill for process (required by React in content scripts)
(globalThis as any).process = (globalThis as any).process || {};
(globalThis as any).process.env = (globalThis as any).process.env || {};
(globalThis as any).process.env.NODE_ENV = (globalThis as any).process.env.NODE_ENV || "production";

// Preload JetBrains Mono font
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap";
document.head.appendChild(fontLink);