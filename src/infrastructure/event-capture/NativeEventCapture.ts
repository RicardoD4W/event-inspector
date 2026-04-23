/**
 * Native Event Capture - Infrastructure Layer
 *
 * Implements event capture using DOM addEventListener
 */

import type { EventRecord } from '../../domain/entities/EventRecord';
import { generateEventId } from '../../domain/entities/EventRecord';
import { getCssSelector } from '../css-selector/CssSelector';
import { syncEvents } from '../store/StateStore';

const NATIVE_EVENT_TYPES = [
  'click',
  'input',
  'submit',
  'focus',
  'blur',
  'mouseenter',
  'mouseleave',
  'keydown',
  'keyup',
  'change',
  'load',
  'DOMContentLoaded',
  'error',
  'scroll',
] as const;

let isCapturing = true; // Starts ON - capturing enabled by default
let isPanelVisible = true;
let events: EventRecord[] = [];
let panelRoot: Element | null = null;

/**
 * Handle a native event
 */
function handleNativeEvent(event: Event): void {
  if (!isCapturing) return;

  // Get the actual element that received the event (not parent elements)
  // Use composedPath to get the actual target, not event.target which might be a text node
  const path = event.composedPath();
  const target = (path[0] instanceof Element ? path[0] : event.target) as Element;
  
  if (!target || !(target instanceof Element)) return;

  // Don't capture events from the panel itself
  if (panelRoot && panelRoot.contains(target as Node)) return;

  const record: EventRecord = {
    id: generateEventId(),
    name: event.type,
    eventType: 'native',
    target: getCssSelector(target),
    targetElement: target,
    timestamp: Date.now(),
    composedPath: path.filter((node): node is Element => node instanceof Element),
  };

  events.unshift(record);
  
  // Sync immediately - reactive!
  syncEvents();
}

/**
 * Start capturing native events
 */
export function startCapture(): void {
  for (const eventType of NATIVE_EVENT_TYPES) {
    // Use bubbling phase to get only the origin target
    window.addEventListener(eventType, handleNativeEvent, false);
  }
}

/**
 * Stop capturing events
 */
export function stopCapture(): void {
  for (const eventType of NATIVE_EVENT_TYPES) {
    window.removeEventListener(eventType, handleNativeEvent, false);
  }
}

/**
 * Toggle capture on/off
 */
export function toggleCapture(): boolean {
  isCapturing = !isCapturing;
  return isCapturing;
}

/**
 * Get capture state
 */
export function isCaptureEnabled(): boolean {
  return isCapturing;
}

/**
 * Set panel visibility state
 */
export function setPanelVisible(visible: boolean): void {
  isPanelVisible = visible;
}

/**
 * Get panel visibility state
 */
export function getIsPanelVisible(): boolean {
  return isPanelVisible;
}

/**
 * Set the panel's root element (to avoid capturing panel events)
 */
export function setPanelRoot(root: Element): void {
  panelRoot = root;
}

/**
 * Clear all captured events
 */
export function clearEvents(): void {
  events = [];
}

/**
 * Get all events
 */
export function getEvents(): EventRecord[] {
  return events;
}

/**
 * Add a custom event to the capture
 */
export function addCustomEvent(
  name: string,
  targetElement: Element,
  detail?: unknown
): EventRecord {
  const record: EventRecord = {
    id: generateEventId(),
    name,
    eventType: 'custom',
    target: getCssSelector(targetElement),
    targetElement,
    timestamp: Date.now(),
    detail,
  };

  events.unshift(record);
  return record;
}