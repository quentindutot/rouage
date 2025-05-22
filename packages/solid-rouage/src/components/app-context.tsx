import { type JSX, createContext, useContext } from 'solid-js'

export interface PageContext {
  status: number
  headers: Record<string, string>
  attributes: Record<string, Record<string, unknown>>
}

export const createPageContext = (): PageContext => ({
  status: 200,
  headers: {},
  attributes: {},
})

export interface AppContextInterface {
  initialPath: string | undefined
  pageContext: PageContext | undefined
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
