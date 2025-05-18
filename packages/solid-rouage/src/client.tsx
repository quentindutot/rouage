// biome-ignore lint/performance/noBarrelFile: <explanation>
// biome-ignore lint/performance/noReExportAll: <explanation>
export * from './components/app.jsx'
// biome-ignore lint/performance/noReExportAll: <explanation>
export * from './components/metas.jsx'
// biome-ignore lint/performance/noReExportAll: <explanation>
export * from './components/router.jsx'

export const createServerFunction = <Handler,>(handler: Handler): Handler => handler
