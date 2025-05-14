import { readFile } from 'node:fs/promises'
import type { H3Event } from 'h3-nightly'
import { FILE_COMPRESSIONS, getExtensionMimeType, getFileExtension } from './file-encoding.js'
import { getFilePath } from './file-path.js'

type FileContent = string | Buffer | Uint8Array | ReadableStream | null

interface ServeStaticOptions {
  root: string
  event: H3Event
}

export const serveStatic = async ({ root, event }: ServeStaticOptions): Promise<FileContent | undefined> => {
  const pathName = event.url.pathname

  const fileExtension = getFileExtension(pathName)
  if (!fileExtension) {
    return
  }

  const filePath = getFilePath(root, pathName)
  if (!filePath) {
    return
  }

  let fileContent: FileContent = await readFile(filePath).catch(() => null)
  if (!fileContent) {
    return
  }

  const mimeType = getExtensionMimeType(fileExtension)
  if (!mimeType) {
    return
  }

  event.res.headers.set('Content-Type', mimeType)

  const acceptEncodingHeader = event.req.headers.get('Accept-Encoding') || ''
  const acceptEncodingSet = new Set(acceptEncodingHeader.split(',').map((encoding: string) => encoding.trim()))

  for (const { encoding, extension } of FILE_COMPRESSIONS) {
    if (!acceptEncodingSet.has(encoding)) {
      continue
    }

    const compressedContent = await readFile(`${filePath}${extension}`).catch(() => null)
    if (!compressedContent) {
      continue
    }

    fileContent = compressedContent
    event.res.headers.set('Content-Encoding', encoding)
    event.res.headers.set('Vary', 'Accept-Encoding')
    break
  }

  return fileContent
}
