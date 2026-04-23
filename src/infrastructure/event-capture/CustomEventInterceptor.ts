/**
 * Custom Event Interceptor - Infrastructure Layer
 *
 * Hooks EventTarget.prototype.dispatchEvent to capture CustomEvents
 */

const ORIGINAL_DISPATCH = Symbol.for('eventInspector.originalDispatch');

/**
 * Initialize the interceptor
 * @param callback - Function to call when a custom event is dispatched
 */
export function initInterceptor(
  callback: (event: CustomEvent, target: EventTarget) => void
): void {
  if ((EventTarget.prototype.dispatchEvent as any)[ORIGINAL_DISPATCH]) {
    return; // Already initialized
  }

  const originalDispatch = EventTarget.prototype.dispatchEvent;

  (EventTarget.prototype.dispatchEvent as any)[ORIGINAL_DISPATCH] = originalDispatch;

  EventTarget.prototype.dispatchEvent = function (event: Event): boolean {
    const result = originalDispatch.call(this, event);

    if (result && event instanceof CustomEvent) {
      callback(event, this);
    }

    return result;
  };
}