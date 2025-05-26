import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { FeatureHandleReturn } from '../../helpers/shared-types.js'
import { FILE_COMPRESSIONS, getExtensionMimeType, getFileExtension } from './file-encoding.js'
import { getFilePath } from './file-path.js'

export const handleStaticFile = async (options: { pathName: string; acceptEncoding: string }): Promise<
  FeatureHandleReturn<Buffer<ArrayBufferLike> | Uint8Array<ArrayBufferLike>> | undefined
> => {
  const fileExtension = getFileExtension(options.pathName)
  if (!fileExtension) {
    return
  }

  const filePath = getFilePath(resolve('build/public'), options.pathName)
  if (!filePath) {
    return
  }

  let fileContent: string | Buffer | Uint8Array | ReadableStream | null = await readFile(filePath).catch(() => null)
  if (!fileContent) {
    return
  }

  const mimeType = getExtensionMimeType(fileExtension)
  if (!mimeType) {
    return
  }

  const responseHeaders: Record<string, string> = { 'Content-Type': mimeType }

  const acceptEncodingSet = new Set(options.acceptEncoding.split(',').map((encoding: string) => encoding.trim()))

  for (const { encoding, extension } of FILE_COMPRESSIONS) {
    if (!acceptEncodingSet.has(encoding)) {
      continue
    }

    const compressedContent = await readFile(`${filePath}${extension}`).catch(() => null)
    if (!compressedContent) {
      continue
    }

    fileContent = compressedContent
    responseHeaders['Content-Encoding'] = encoding
    responseHeaders.Vary = 'Accept-Encoding'
    break
  }

  return { status: 200, headers: responseHeaders, content: fileContent }
}
