/**
 * EventRecord - Domain Entity
 *
 * Pure domain entity representing a captured event.
 * No dependencies on infrastructure or frameworks.
 */

export interface EventRecord {
  id: string;
  name: string;
  eventType: 'native' | 'custom';
  target: string;
  targetElement: Element;
  timestamp: number;
  detail?: unknown;
  bubbles?: boolean;
}

export interface AppState {
  events: EventRecord[];
  paused: boolean;
}

/**
 * Factory function to create a new EventRecord
 */
export function createEventRecord(
  id: string,
  name: string,
  eventType: 'native' | 'custom',
  target: string,
  targetElement: Element,
  detail?: unknown
): EventRecord {
  return {
    id,
    name,
    eventType,
    target,
    targetElement,
    timestamp: Date.now(),
    detail,
  };
}

/**
 * Generate a unique ID for an event record
 */
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}