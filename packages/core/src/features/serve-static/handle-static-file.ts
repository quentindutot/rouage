import { readFile } from 'node:fs/promises'
import { FILE_COMPRESSIONS, getExtensionMimeType, getFileExtension } from './file-encoding.js'
import { getFilePath } from './file-path.js'

export const handleStaticFile = async (options: {
  root: string
  pathName: string
  acceptEncoding: string
}) => {
  const responseHeaders = new Headers()

  const fileExtension = getFileExtension(options.pathName)
  if (!fileExtension) {
    return
  }

  const filePath = getFilePath(options.root, options.pathName)
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

  responseHeaders.set('Content-Type', mimeType)

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
    responseHeaders.set('Content-Encoding', encoding)
    responseHeaders.set('Vary', 'Accept-Encoding')
    break
  }

  return { headers: responseHeaders, content: fileContent }
}
