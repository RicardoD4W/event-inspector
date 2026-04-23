/**
 * Event Inspector - Content Script Entry Point
 *
 * This script is injected into every page and creates the floating panel
 * that captures and displays all events.
 * Supports toggle behavior: clicking the extension icon shows/hides the panel.
 */

// Polyfill for React 19 which uses process.env.NODE_ENV in browser
// This is now defined via vite.config.ts define option

import { initInterceptor } from "./interceptor";
import type { EventRecord } from "./event-capture";
import {
  startCapture,
  toggleCapture,
  clearEvents,
  addCustomEvent,
  getIsPanelVisible,
  setPanelVisible,
} from "./event-capture";
import { createRoot } from "react-dom/client";
import { useCallback } from "react";
import { Panel } from "./Panel";

const PANEL_CONTAINER_ID = "event-inspector-container";

// Flag to prevent multiple injections
declare global {
  interface Window {
    eventInspectorInitialized?: boolean;
  }
}

/**
 * React Panel Component with state management
 */
function ReactPanel({
  events,
  onClear,
  onPauseToggle,
}: {
  events: EventRecord[];
  onClear: () => void;
  onPauseToggle: () => void;
}) {
  const handleEventClick = useCallback((record: EventRecord) => {
    const event = new CustomEvent("event-inspector-event-click", {
      detail: record,
    });
    window.dispatchEvent(event);
  }, []);

  return (
    <Panel
      events={events}
      onClear={onClear}
      onPauseToggle={onPauseToggle}
      onEventClick={handleEventClick}
    />
  );
}

/**
 * Create the panel container and mount React
 */
function createPanel(): {
  update: (events: EventRecord[], paused: boolean) => void;
} {
  // Create container for the panel
  const container = document.createElement("div");
  container.id = PANEL_CONTAINER_ID;
  container.style.cssText =
    "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;";
  document.body.appendChild(container);

  // Mount React app
  const root = createRoot(container);

  let events: EventRecord[] = [];
  let paused = false;

  const render = () => {
    root.render(
      <ReactPanel
        events={events}
        onClear={() => {
          clearEvents();
          events = [];
          render();
        }}
        onPauseToggle={() => {
          toggleCapture();
          paused = !paused;
          render();
        }}
      />,
    );
  };

  render();

  return {
    update: (newEvents: EventRecord[], newPaused: boolean) => {
      events = newEvents;
      paused = newPaused;
      render();
    },
  };
}

/**
 * Get existing panel or create if doesn't exist
 */
let panelRef: {
  update: (events: EventRecord[], paused: boolean) => void;
} | null = null;

function getOrCreatePanel(): {
  update: (events: EventRecord[], paused: boolean) => void;
} {
  if (!panelRef) {
    panelRef = createPanel();
    startCaptureSystem();
  }
  return panelRef;
}

/**
 * Toggle panel visibility
 */
function togglePanelVisibility(): void {
  const panel = getOrCreatePanel();
  const newState = !getIsPanelVisible();
  setPanelVisible(newState);

  const container = document.getElementById(PANEL_CONTAINER_ID);
  if (container) {
    container.style.display = newState ? "block" : "none";
  }

  if (newState) {
    panel.update(currentEvents, false);
  }
}

function scrollToElement(element: Element): void {
  element.scrollIntoView({ behavior: "smooth", block: "center" });

  const htmlElement = element as HTMLElement;
  const originalOutline = htmlElement.style.outline;
  htmlElement.style.outline = "2px solid #FF9800";
  htmlElement.style.outlineOffset = "2px";

  setTimeout(() => {
    htmlElement.style.outline = originalOutline || "";
    htmlElement.style.outlineOffset = "";
  }, 2000);
}

/**
 * Start capturing native events
 */
let currentEvents: EventRecord[] = [];

function startCaptureSystem(): void {
  startCapture((record: EventRecord) => {
    if (getIsPanelVisible() && panelRef) {
      currentEvents = [record, ...currentEvents];
      panelRef.update(currentEvents, false);
    }
  });
}

/**
 * Main initialization - called when script is injected
 */
function init(): void {
  console.log("[Event Inspector] Content script loaded");

  // Initialize interceptor for CustomEvent dispatch FIRST
  initInterceptor((event: CustomEvent, target: EventTarget) => {
    const element = target as Element;
    if (element instanceof Element) {
      addCustomEvent(event.type, element, event.detail);
    }
  });

  // Check if we should toggle visibility or create new panel
  togglePanelVisibility();
}

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "toggle") {
    togglePanelVisibility();
    sendResponse({ success: true });
  }
  return true;
});

// Listen for event-click from React panel
window.addEventListener("event-inspector-event-click", ((
  e: CustomEvent<EventRecord>,
) => {
  if (e.detail?.targetElement) {
    scrollToElement(e.detail.targetElement);
  }
}) as EventListener);
