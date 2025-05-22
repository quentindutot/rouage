import type { JSX } from 'solid-js'
import { AppProvider, type PageContext } from './app-context.jsx'

export interface AppProps {
  initialPath: string | undefined
  pageContext: PageContext | undefined
}

export const createApp = (children: () => JSX.Element) => (appProps: AppProps) => (
  <AppProvider value={{ initialPath: appProps.initialPath, pageContext: appProps.pageContext }}>
    {children()}
  </AppProvider>
)
