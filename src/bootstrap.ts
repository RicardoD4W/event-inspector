/**
 * Bootstrap script - Polyfill for process (required by React in content scripts)
 * This runs BEFORE the main content script
 */

(globalThis as any).process = (globalThis as any).process || {};
(globalThis as any).process.env = (globalThis as any).process.env || {};
(globalThis as any).process.env.NODE_ENV = (globalThis as any).process.env.NODE_ENV || "production";