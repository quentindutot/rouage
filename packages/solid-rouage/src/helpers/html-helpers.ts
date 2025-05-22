import type { JSX } from 'solid-js'

export const stringHtmlAttributes = (attributes: Record<string, unknown>) => {
  return Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')
}

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

export const dedupeHeadTags = (html: string) => {
  const seen = new Set<string>()
  const tags = html.split(/(?=<)/g).reverse() // reverse to prioritize last

  const deduped = tags.filter((tag) => {
    const cleaned = tag.trim()

    if (seen.has(cleaned)) {
      return false
    }

    seen.add(cleaned)

    return true
  })

  return deduped.reverse().join('') // restore original order
}
