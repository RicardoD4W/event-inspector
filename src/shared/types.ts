/**
 * Event Inspector - Shared Types
 */

export interface EventRecord {
  id: string;
  name: string;           // event type (click, my-event, etc.)
  eventType: 'native' | 'custom';
  target: string;        // CSS selector
  targetElement: Element; // referencia al elemento (no serializable)
  timestamp: number;      // Date.now()
  detail?: unknown;       // event.detail para custom events
  bubbles?: boolean;     // propagation status
}

export interface PanelState {
  isVisible: boolean;
  isMinimized: boolean;
  isPaused: boolean;
  events: EventRecord[];
}

export type EventCallback = (event: EventRecord) => void;