/**
 * Content Script Entry Point - Presentation Layer
 *
 * Entry point for the Chrome extension content script.
 * Injects the Event Inspector and panel.
 */

import { createRoot } from "react-dom/client";
import { useEffect, useState, useCallback } from "react";
import { Panel } from "../ui/Panel";
import { getState, setState, subscribe } from "../../infrastructure/store/StateStore";
import type { AppState } from "../../domain/entities/EventRecord";
import {
  startCapture,
  toggleCapture,
  clearEvents,
  addCustomEvent,
  getIsPanelVisible,
  setPanelVisible,
  setPanelRoot,
  isCaptureEnabled,
  getEvents,
} from "../../infrastructure/event-capture/NativeEventCapture";
import { initInterceptor } from "../../infrastructure/event-capture/CustomEventInterceptor";
import type { EventRecord } from "../../domain/entities/EventRecord";

const PANEL_CONTAINER_ID = "event-inspector-container";

// Prevent multiple injections
let initialized = false;

/**
 * React Panel - connected to store via subscription
 */
function ReactPanel({
  onClear,
  onPauseToggle,
}: {
  onClear: () => void;
  onPauseToggle: () => void;
}) {
  const [state, setLocalState] = useState<AppState>(getState());

  useEffect(() => {
    const unsubscribe = subscribe(setLocalState);
    return unsubscribe;
  }, []);

  const handleEventClick = useCallback((record: EventRecord) => {
    const event = new CustomEvent("event-inspector-event-click", {
      detail: record,
    });
    window.dispatchEvent(event);
  }, []);

  return (
    <Panel
      events={state.events}
      paused={state.paused}
      onClear={onClear}
      onPauseToggle={onPauseToggle}
      onEventClick={handleEventClick}
    />
  );
}

/**
 * Create the panel container and mount React
 */
function createPanel(): void {
  const container = document.createElement("div");
  container.id = PANEL_CONTAINER_ID;
  container.style.cssText =
    "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;";
  document.body.appendChild(container);

  setPanelRoot(container);

  // Initialize store from event-capture
  setState({ events: getEvents(), paused: !isCaptureEnabled() });

  const root = createRoot(container);
  const render = () => {
    root.render(
      <ReactPanel
        onClear={() => {
          clearEvents();
          setState({ events: getEvents() });
        }}
        onPauseToggle={() => {
          const newCaptureState = toggleCapture();
          setState({ paused: !newCaptureState });
        }}
      />
    );
  };

  render();

  // Start capture
  startCapture();
}

/**
 * Get existing panel or create if doesn't exist
 */
function getOrCreatePanel(): void {
  if (!initialized) {
    initialized = true;
    createPanel();
  }
}

/**
 * Toggle panel visibility (called from extension icon click)
 */
function togglePanelVisibility(): void {
  getOrCreatePanel();
  const newState = !getIsPanelVisible();
  setPanelVisible(newState);

  const container = document.getElementById(PANEL_CONTAINER_ID);
  if (container) {
    container.style.display = newState ? "block" : "none";
  }

  // Update store with current events
  if (newState) {
    setState({ events: getEvents() });
  }
}

/**
 * Show panel on initial load
 */
function showPanel(): void {
  getOrCreatePanel();
  setPanelVisible(true);

  const container = document.getElementById(PANEL_CONTAINER_ID);
  if (container) {
    container.style.display = "block";
  }

  setState({ events: getEvents() });
}

/**
 * Main initialization - called when script is injected
 */
function init(): void {
  // Initialize interceptor for CustomEvent dispatch FIRST
  initInterceptor((event: CustomEvent, target: EventTarget) => {
    const element = target as Element;
    if (element instanceof Element) {
      addCustomEvent(event.type, element, event.detail);
    }
  });

  // Show panel on first load
  showPanel();
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
window.addEventListener(
  "event-inspector-event-click",
  ((e: CustomEvent) => {
    if (e.detail?.targetElement) {
      e.detail.targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      const element = e.detail.targetElement as HTMLElement;
      element.style.outline = "2px solid #FF9800";
      element.style.outlineOffset = "2px";
      setTimeout(() => {
        element.style.outline = "";
        element.style.outlineOffset = "";
      }, 2000);
    }
  }) as EventListener
);