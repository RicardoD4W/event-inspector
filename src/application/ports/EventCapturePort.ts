/**
 * Event Capture Port - Application Layer
 *
 * Abstract interface (port) for event capturing.
 * Infrastructure will implement this interface.
 */

import type { EventRecord } from '../../domain/entities/EventRecord';

export interface EventCapturePort {
  /**
   * Start capturing native events
   */
  startCapture(): void;
  
  /**
   * Stop capturing events
   */
  stopCapture(): void;
  
  /**
   * Toggle capture state
   * @returns current capture state
   */
  toggleCapture(): boolean;
  
  /**
   * Check if capture is enabled
   */
  isCaptureEnabled(): boolean;
  
  /**
   * Get all captured events
   */
  getEvents(): EventRecord[];
  
  /**
   * Clear all events
   */
  clearEvents(): void;
  
  /**
   * Add a custom event manually
   */
  addCustomEvent(
    name: string,
    targetElement: Element,
    detail?: unknown
  ): EventRecord;
  
  /**
   * Set panel visibility
   */
  setPanelVisible(visible: boolean): void;
  
  /**
   * Get panel visibility
   */
  getIsPanelVisible(): boolean;
  
  /**
   * Set panel root element
   */
  setPanelRoot(root: Element): void;
}

export interface PanelControllerPort {
  /**
   * Show the panel
   */
  show(): void;
  
  /**
   * Hide the panel
   */
  hide(): void;
  
  /**
   * Toggle panel visibility
   */
  toggle(): void;
  
  /**
   * Check if panel is visible
   */
  isVisible(): boolean;
}