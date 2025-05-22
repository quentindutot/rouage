import { MetaProvider as _MetaProvider } from '@solidjs/meta'
import { type JSX, createContext, useContext } from 'solid-js'

export interface MetaContextInterface {
  status: number
  headers: Record<string, string>
  attributes: Record<string, Record<string, unknown>>
}

export const createMetaContext = (): MetaContextInterface => ({
  status: 200,
  headers: {},
  attributes: {},
})

const MetaContext = createContext<MetaContextInterface | undefined>()

export const MetaProvider = (props: { value: MetaContextInterface | undefined; children: JSX.Element }) => (
  <MetaContext.Provider value={props.value}>
    <_MetaProvider>{props.children}</_MetaProvider>
  </MetaContext.Provider>
)

export const useMetaContext = () => {
  const context = useContext(MetaContext)
  if (!context) {
    throw new Error('useMetaContext must be used within a MetaProvider')
  }
  return context
}
