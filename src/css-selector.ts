/**
 * CSS Selector Generator - Creates unique CSS selectors for elements
 */

/**
 * Generate a CSS selector for an element
 */
export function getCssSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`
  }

  if (element.getAttribute('data-testid')) {
    return `[data-testid="${element.getAttribute('data-testid')}"]`
  }

  if (element.getAttribute('data-test')) {
    return `[data-test="${element.getAttribute('data-test')}"]`
  }

  // Build selector from classes
  const className = element.className
    .split(' ')
    .filter((c) => c && !c.includes('event-inspector'))
    .slice(0, 2)
    .join('.')

  if (className) {
    return `${element.tagName.toLowerCase()}.${className}`
  }

  // Fallback to tag name only
  return element.tagName.toLowerCase()
}