import { type JSX, createContext, useContext } from 'solid-js'
import type { MetaContextInterface } from './metas/meta-context.jsx'

export interface AppContextInterface {
  initialPath: string | undefined
  metaContext: MetaContextInterface | undefined
}

const AppContext = createContext<AppContextInterface | undefined>()

export const AppProvider = (props: { value: AppContextInterface | undefined; children: JSX.Element }) => (
  <AppContext.Provider value={props.value}>{props.children}</AppContext.Provider>
)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within a AppProvider')
  }
  return context
}
