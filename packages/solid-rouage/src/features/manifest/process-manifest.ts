import { readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import type { Manifest, ManifestChunk } from 'vite'

const getManifestEntry = async (options: { manifestPath: string; manifestKey: string }) => {
  const manifestContent = await readFile(options.manifestPath, 'utf-8')
  const manifestEntries = JSON.parse(manifestContent) as Manifest
  return manifestEntries[options.manifestKey] as ManifestChunk | undefined
}

export const normalizeManifestEntries = async (options: { manifestPath: string }) => {
  const manifestContent = await readFile(options.manifestPath, 'utf-8')
  const manifestEntries = JSON.parse(manifestContent) as Manifest

  const normalizedManifest = Object.fromEntries(
    Object.entries(manifestEntries).map(([key, value]) => {
      const normalize = (path: string) => {
        const filename = path.split('/').pop() ?? path
        return filename.startsWith('src/') ? filename : `src/${filename}`
      }

      const normalizedKey = normalize(key)
      const normalizedValue = { ...value }
      if (normalizedValue.src) {
        normalizedValue.src = normalize(normalizedValue.src)
      }

      return [normalizedKey, normalizedValue]
    }),
  )

  await writeFile(options.manifestPath, JSON.stringify(normalizedManifest, null, 2), 'utf-8')
}

export const deleteManifestViteFolder = async (options: { manifestPath: string }) => {
  await rm(dirname(options.manifestPath), { recursive: true })
}

export const replaceManifestClientEntry = async (options: {
  manifestPath: string
  filePath: string
  fileCode: string
}) => {
  let replaced = options.fileCode

  const clientEntry = await getManifestEntry({
    manifestPath: options.manifestPath,
    manifestKey: 'src/virtual:entry-client.tsx',
  })
  if (clientEntry) {
    replaced = replaced.replace('__ENTRY_CLIENT_ASSET__', clientEntry.file)
  }

  return replaced
}

export const replaceManifestUrlImports = async (options: {
  manifestPath: string
  filePath: string
  fileCode: string
}) => {
  // Regex to find all ?url imports
  // Handles both 'import ... from' and 'const ... = require(...)'
  const importUrlRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+\?url)['"];?/g

  let replaced = options.fileCode
  let match: RegExpExecArray | null

  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  while ((match = importUrlRegex.exec(options.fileCode))) {
    const varName = match[1]
    const assetPath = match[2]

    // biome-ignore lint/performance/useTopLevelRegex: <explanation>
    const assetLookup = assetPath.replace(/\?url$/, '')

    // Vite manifest keys are usually like "src/app.css"
    // Try to resolve to project root
    let manifestKey = assetLookup
    if (manifestKey.startsWith('./')) {
      manifestKey = manifestKey.slice(2)
    }
    if (manifestKey.startsWith('src/')) {
      // manifestKey = manifestKey
    } else {
      // Try to resolve relative to the current file
      const absAssetPath = resolve(dirname(options.filePath), assetLookup)
      manifestKey = relative(process.cwd(), absAssetPath)
    }

    const manifestEntry =
      (await getManifestEntry({ manifestPath: options.manifestPath, manifestKey })) ||
      (await getManifestEntry({
        manifestPath: options.manifestPath,
        manifestKey: `src/${assetLookup.split('/').pop()}`,
      }))

    // Replace import with direct assignment to the real URL
    if (manifestEntry) {
      replaced = replaced.replace(match[0], `const ${varName} = "/assets/${manifestEntry.file.split('/').pop()}";`)
    }
  }

  return replaced
}
