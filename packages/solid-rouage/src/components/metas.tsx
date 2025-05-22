import { Base as _Base, Link as _Link, Meta as _Meta, Style as _Style, Title as _Title } from '@solidjs/meta'
import type { JSX } from 'solid-js'
import { isServer } from 'solid-js/web'
import { applyHtmlAttributes } from '../helpers/html-helpers.js'
import { useAppContext } from './app-context.jsx'

const createHtmlAttributeComponent = <T extends HTMLElement>(tagName: string) =>
  isServer
    ? (props: Omit<JSX.HTMLAttributes<T>, 'children'>) => {
        const appContext = useAppContext()
        if (appContext.pageContext) {
          appContext.pageContext.attributes[tagName] = props
        }
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

export const Header = isServer
  ? (props: { name: string; value: string }) => {
      const appContext = useAppContext()
      if (appContext.pageContext) {
        appContext.pageContext.headers[props.name] = props.value
      }
      return null
    }
  : (_props: { name: string; value: string }) => {
      return null
    }

export const Status = isServer
  ? (props: { code: number }) => {
      const appContext = useAppContext()
      if (appContext.pageContext) {
        appContext.pageContext.status = props.code
      }
      return null
    }
  : (_props: { code: number }) => {
      return null
    }
