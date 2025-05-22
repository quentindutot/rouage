import { Base as _Base, Link as _Link, Meta as _Meta, Style as _Style, Title as _Title } from '@solidjs/meta'
import type { JSX } from 'solid-js'
import { isServer } from 'solid-js/web'
import { applyHtmlAttributes } from '../utilities/html-attributes.js'
import { useMetaContext } from './metas/meta-context.jsx'

const createHtmlAttributeComponent = <T extends HTMLElement>(tagName: string) =>
  isServer
    ? (props: Omit<JSX.HTMLAttributes<T>, 'children'>) => {
        const metaContext = useMetaContext()
        metaContext.attrs[tagName] = props
        return null
      }
    : (props: Omit<JSX.HTMLAttributes<T>, 'children'>) => {
        const element = document.getElementsByTagName(tagName)[0] as T
        applyHtmlAttributes(element, props)
        return null
      }

export const Html = createHtmlAttributeComponent<HTMLHtmlElement>('html')
export const Head = createHtmlAttributeComponent<HTMLHeadElement>('head')
export const Body = createHtmlAttributeComponent<HTMLBodyElement>('body')

export const Meta = _Meta
export const Base = _Base
export const Link = _Link
export const Style = _Style
export const Title = _Title

// export const Header = () => {}
// export const Status = () => {}
