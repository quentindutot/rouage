import type { JSX } from 'solid-js'
import { AppProvider } from './app-context.jsx'
import type { MetaContextInterface } from './metas/meta-context.jsx'

export interface AppProps {
  initialPath: string | undefined
  metaContext: MetaContextInterface | undefined
}

export const createApp = (children: () => JSX.Element) => (appProps: AppProps) => (
  <AppProvider value={{ initialPath: appProps.initialPath, metaContext: appProps.metaContext }}>
    {children()}
  </AppProvider>
)
