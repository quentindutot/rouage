import type { FeatureHandleReturn } from '../../helpers/shared-types.js'

// biome-ignore lint/suspicious/useAwait: <explanation>
export const handleServerFunction = async (_options: { pathName: string }): Promise<
  FeatureHandleReturn<string> | undefined
> => {
  return

  // const serverFunctionId = options.pathName.replace('/_server/', '')

  // // @ts-expect-error
  // const serverFunctionImport = await import('virtual:server-functions')
  // const serverFunctionManifest = serverFunctionImport.default

  // const fileImport = serverFunctionManifest[serverFunctionId]
  // if (!fileImport) {
  //   return
  // }

  // const handler = await fileImport()
  // if (!handler) {
  //   return
  // }

  // const responseHeaders: Record<string, string> = {}

  // const result = await handler()

  // return { status: 200, headers: responseHeaders, content: JSON.stringify(result) }
}
