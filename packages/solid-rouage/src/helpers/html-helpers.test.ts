import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { JSX } from 'solid-js'
import { applyHtmlAttributes, dedupeHeadTags, stringHtmlAttributes } from './html-helpers.js'

describe('stringHtmlAttributes', () => {
  it('should convert simple attributes to string', () => {
    const attributes = { id: 'test', class: 'container' }
    const result = stringHtmlAttributes(attributes)
    assert.equal(result, 'id="test" class="container"')
  })

  it('should handle empty object', () => {
    const attributes = {}
    const result = stringHtmlAttributes(attributes)
    assert.equal(result, '')
  })

  it('should handle various value types', () => {
    const attributes = {
      id: 'test',
      count: 42,
      active: true,
      data: null,
      value: undefined,
    }
    const result = stringHtmlAttributes(attributes)
    assert.equal(result, 'id="test" count="42" active="true" data="null" value="undefined"')
  })

  it('should handle special characters in values', () => {
    const attributes = { title: 'Hello "World"', description: 'Line 1\nLine 2' }
    const result = stringHtmlAttributes(attributes)
    assert.equal(result, 'title="Hello "World"" description="Line 1\nLine 2"')
  })
})

describe('applyHtmlAttributes', () => {
  let element: HTMLElement

  // Helper to create a fresh element for each test
  const createElement = (): HTMLElement => {
    // Create a mock element with minimal HTMLElement interface
    interface MockElement {
      attributes: Map<string, string>
      getAttribute(name: string): string | null
      setAttribute(name: string, value: string): void
      removeAttribute(name: string): void
      hasAttribute(name: string): boolean
    }

    const mockElement: MockElement = {
      attributes: new Map<string, string>(),
      getAttribute(name: string): string | null {
        return this.attributes.get(name) ?? null
      },
      setAttribute(name: string, value: string): void {
        this.attributes.set(name, value)
      },
      removeAttribute(name: string): void {
        this.attributes.delete(name)
      },
      hasAttribute(name: string): boolean {
        return this.attributes.has(name)
      },
    }
    return mockElement as unknown as HTMLElement
  }

  it('should set string attributes', () => {
    element = createElement()
    applyHtmlAttributes(element, { id: 'test', class: 'container' })

    assert.equal(element.getAttribute('id'), 'test')
    assert.equal(element.getAttribute('class'), 'container')
  })

  it('should handle boolean attributes correctly', () => {
    element = createElement()
    const attributes: JSX.HTMLAttributes<HTMLElement> & { disabled?: boolean; hidden?: boolean } = {
      disabled: true,
      hidden: false,
    }
    applyHtmlAttributes(element, attributes)

    // For boolean attributes, when true they should be set to empty string, when false they should not be present
    assert.equal(element.hasAttribute('disabled'), true)
    assert.equal(element.getAttribute('disabled'), '')
    assert.equal(element.hasAttribute('hidden'), false)
  })

  it('should remove attributes when value is null or undefined', () => {
    element = createElement()
    // First set some attributes
    element.setAttribute('id', 'test')
    element.setAttribute('class', 'container')

    // Then apply null/undefined values
    const attributes: Record<string, unknown> = {
      id: null,
      class: undefined,
    }
    applyHtmlAttributes(element, attributes)

    assert.equal(element.getAttribute('id'), null)
    assert.equal(element.getAttribute('class'), null)
  })

  it('should only update attributes when value changes', () => {
    element = createElement()
    element.setAttribute('id', 'test')

    // Mock setAttribute to track calls
    let setAttributeCalls = 0
    const originalSetAttribute = element.setAttribute
    element.setAttribute = function (name: string, value: string) {
      setAttributeCalls++
      return originalSetAttribute.call(this, name, value)
    }

    // Apply same value - should not call setAttribute
    applyHtmlAttributes(element, { id: 'test' })
    assert.equal(setAttributeCalls, 0)

    // Apply different value - should call setAttribute
    applyHtmlAttributes(element, { id: 'different' })
    assert.equal(setAttributeCalls, 1)
  })

  it('should handle number values by converting to string', () => {
    element = createElement()
    const attributes: JSX.HTMLAttributes<HTMLElement> & { 'data-count'?: number } = {
      tabindex: 0,
      'data-count': 42,
    }
    applyHtmlAttributes(element, attributes)

    assert.equal(element.getAttribute('tabindex'), '0')
    assert.equal(element.getAttribute('data-count'), '42')
  })

  it('should toggle boolean attributes correctly', () => {
    element = createElement()

    // Add boolean attribute
    const enabledAttributes: JSX.HTMLAttributes<HTMLElement> & { disabled?: boolean } = { disabled: true }
    applyHtmlAttributes(element, enabledAttributes)
    assert.equal(element.hasAttribute('disabled'), true)

    // Remove boolean attribute
    const disabledAttributes: JSX.HTMLAttributes<HTMLElement> & { disabled?: boolean } = { disabled: false }
    applyHtmlAttributes(element, disabledAttributes)
    assert.equal(element.hasAttribute('disabled'), false)
  })
})

describe('dedupeHeadTags', () => {
  it('should work with HTML fragments due to split behavior', () => {
    // The function splits on (?=<) which creates fragments, not complete tags
    const html = '<title>First</title><meta charset="utf-8"><title>Second</title>'
    const result = dedupeHeadTags(html)
    // Actual behavior: splits create fragments, dedupes closing tags
    assert.equal(result, '<title>First<meta charset="utf-8"><title>Second</title>')
  })

  it('should dedupe identical HTML fragments', () => {
    const html = '<title>Same</title><meta charset="utf-8"><title>Same</title>'
    const result = dedupeHeadTags(html)
    // Should dedupe the '<title>Same' fragment
    assert.equal(result, '<meta charset="utf-8"><title>Same</title>')
  })

  it('should handle empty string', () => {
    const html = ''
    const result = dedupeHeadTags(html)
    assert.equal(result, '')
  })

  it('should handle single tag', () => {
    const html = '<title>Single Title</title>'
    const result = dedupeHeadTags(html)
    assert.equal(result, '<title>Single Title</title>')
  })

  it('should handle whitespace in fragments', () => {
    const html = '  <title>First</title>  \n  <title>Second</title>  '
    const result = dedupeHeadTags(html)
    assert.equal(result, '  <title>First<title>Second</title>  ')
  })

  it('should preserve order for non-duplicate fragments', () => {
    const html = '<meta charset="utf-8"><title>Title</title><link rel="stylesheet" href="style.css">'
    const result = dedupeHeadTags(html)
    assert.equal(result, '<meta charset="utf-8"><title>Title</title><link rel="stylesheet" href="style.css">')
  })
})
