/**
 * Event Capture - Captures native DOM events using capturing phase
 */

import { getCssSelector } from './css-selector'

export interface EventRecord {
  id: string
  name: string
  eventType: 'native' | 'custom'
  target: string
  targetElement: Element
  timestamp: number
  detail?: unknown
  bubbles?: boolean
}

const EVENT_TYPES = [
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
]

let isCapturing = true
let isPanelVisible = true
let events: EventRecord[] = []
let onEventCaptured: ((record: EventRecord) => void) | null = null
let panelRoot: Element | null = null

/**
 * Generate a unique ID for an event record
 */
function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Set the panel's root element (to avoid capturing panel events)
 */
export function setPanelRoot(root: Element): void {
  panelRoot = root
}

/**
 * Handle a native event
 */
function handleNativeEvent(event: Event): void {
  if (!isCapturing) return

  const target = event.target
  if (!target || !(target instanceof Element)) return

  // Don't capture events from the panel itself
  if (panelRoot && panelRoot.contains(target as Node)) return

  const record: EventRecord = {
    id: generateId(),
    name: event.type,
    eventType: 'native',
    target: getCssSelector(target),
    targetElement: target,
    timestamp: Date.now(),
  }

  events.unshift(record)

  if (onEventCaptured) {
    onEventCaptured(record)
  }
}

/**
 * Start capturing native events
 */
export function startCapture(callback: (record: EventRecord) => void): void {
  onEventCaptured = callback

  for (const eventType of EVENT_TYPES) {
    window.addEventListener(eventType, handleNativeEvent, true)
  }
}

/**
 * Stop capturing events
 */
export function stopCapture(): void {
  for (const eventType of EVENT_TYPES) {
    window.removeEventListener(eventType, handleNativeEvent, true)
  }
}

/**
 * Toggle capture on/off
 */
export function toggleCapture(): boolean {
  isCapturing = !isCapturing
  return isCapturing
}

/**
 * Get capture state
 */
export function isCaptureEnabled(): boolean {
  return isCapturing
}

/**
 * Set panel visibility state
 */
export function setPanelVisible(visible: boolean): void {
  isPanelVisible = visible
}

/**
 * Get panel visibility state
 */
export function getIsPanelVisible(): boolean {
  return isPanelVisible
}

/**
 * Clear all captured events
 */
export function clearEvents(): void {
  events = []
}

/**
 * Get all events
 */
export function getEvents(): EventRecord[] {
  return events
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
    id: generateId(),
    name,
    eventType: 'custom',
    target: getCssSelector(targetElement),
    targetElement,
    timestamp: Date.now(),
    detail,
  }

  events.unshift(record)

  if (onEventCaptured) {
    onEventCaptured(record)
  }

  return record
}