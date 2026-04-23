/**
 * State Store - Infrastructure Layer
 *
 * Simple store for state management following clean architecture
 */

import type { AppState } from '../../domain/entities/EventRecord';
import { getEvents } from '../event-capture/NativeEventCapture';

let state: AppState = {
  events: [],
  paused: false, // Starts ON (capture enabled)
};

type Listener = (state: AppState) => void;
const listeners: Set<Listener> = new Set();

export function getState(): AppState {
  return state;
}

export function setState(newState: Partial<AppState>): void {
  state = { ...state, ...newState };
  listeners.forEach((listener) => listener(state));
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Export function to sync events from event-capture
export function syncEvents(): void {
  setState({ events: getEvents() });
}