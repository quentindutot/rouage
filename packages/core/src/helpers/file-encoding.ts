const commonMimes: Record<string, string> = {
  avif: 'image/avif',
  css: 'text/css',
  csv: 'text/csv',
  gif: 'image/gif',
  gz: 'application/gzip',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'text/javascript',
  json: 'application/json',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  otf: 'font/otf',
  pdf: 'application/pdf',
  png: 'image/png',
  svg: 'image/svg+xml',
  ttf: 'font/ttf',
  txt: 'text/plain',
  wasm: 'application/wasm',
  webp: 'image/webp',
  woff: 'font/woff',
  woff2: 'font/woff2',
  xml: 'application/xml',
  zip: 'application/zip',
}

const FILE_EXTENSION_REGEX = /\.([a-zA-Z0-9]+?)$/

export const FILE_COMPRESSIONS = [
  { encoding: 'br', extension: '.br' },
  { encoding: 'gzip', extension: '.gz' },
]

export const getFileExtension = (path: string) => {
  const match = path.match(FILE_EXTENSION_REGEX)
  return match ? match[1] : undefined
}

export const getExtensionMimeType = (extension: string) => {
  let mimeType = commonMimes[extension]
  if (mimeType?.startsWith('text')) {
    mimeType += '; charset=utf-8'
  }
  return mimeType
}
