export const handleServerFunction = async (options: { path: string }) => {
  const serverFunctionId = options.path.replace('/_server/', '')

  // @ts-expect-error
  const serverFunctionImport = await import('virtual:server-functions')
  const serverFunctionManifest = serverFunctionImport.default

  const fileImport = serverFunctionManifest[serverFunctionId]
  if (!fileImport) {
    return
  }

  const handler = await fileImport()
  if (!handler) {
    return
  }

  const result = await handler()

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
