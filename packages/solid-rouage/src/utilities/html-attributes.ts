import type { JSX } from 'solid-js'

export const applyHtmlAttributes = <T extends HTMLElement>(
  element: T,
  attributes: JSX.HTMLAttributes<T>,
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
) => {
  for (const [key, value] of Object.entries(attributes)) {
    const currentValue = element.getAttribute(key)

    if (value === undefined || value === null) {
      if (currentValue !== null) {
        element.removeAttribute(key)
      }
    } else if (typeof value === 'boolean') {
      const hasAttribute = element.hasAttribute(key)
      if (value && !hasAttribute) {
        element.setAttribute(key, '')
      } else if (!value && hasAttribute) {
        element.removeAttribute(key)
      }
    } else {
      const stringValue = String(value)
      if (currentValue !== stringValue) {
        element.setAttribute(key, stringValue)
      }
    }
  }
}

export const stringHtmlAttributes = (attributes: Record<string, unknown>) => {
  return Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')
}
