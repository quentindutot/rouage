import fs from 'node:fs'
import path from 'node:path'
import { generate } from '@babel/generator'
import { parse } from '@babel/parser'
import traverseImport from '@babel/traverse'

// @ts-expect-error
const traverse = traverseImport.default as typeof traverseImport

const EXPORT_DEFAULT_OBJECT_REGEX = /export default ({[\s\S]*})/

interface ServerFunctionManifest {
  [key: string]: string
}

export const transformServerFunction = (options: {
  code: string
  path: string
  template: (sfnId: string) => string
}) => {
  const ast = parse(options.code, { sourceType: 'module', plugins: ['typescript'] })

  const manifest: ServerFunctionManifest = {}

  traverse(ast, {
    // biome-ignore lint/style/useNamingConvention: <explanation>
    CallExpression(path) {
      const callee = path.node.callee
      if (callee.type === 'Identifier' && callee.name === 'createServerFunction' && path.node.arguments.length === 1) {
        // Get the function name from the variable declaration
        const parentPath = path.findParent((p) => p.isVariableDeclarator())

        let id = 'unknown'
        // @ts-expect-error
        if (parentPath?.node.id.type === 'Identifier') {
          // @ts-expect-error
          id = parentPath.node.id.name
        }

        // Add to manifest
        manifest[id] = options.path

        // Function expression
        const fnArg = path.node.arguments[0]
        if (fnArg && (fnArg.type === 'ArrowFunctionExpression' || fnArg.type === 'FunctionExpression')) {
          // @ts-expect-error
          fnArg.body = parse(`async () => {${options.template(id)}}`).program.body[0].expression.body
          fnArg.async = true
        }
      }
    },
  })

  // Write manifest to node_modules/.rouage/server-functions.js
  const manifestPath = path.join(process.cwd(), 'node_modules', '.rouage', 'server-functions.js')
  const manifestDir = path.dirname(manifestPath)

  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true })
  }

  // Read existing manifest if it exists
  let existingManifest: ServerFunctionManifest = {}
  if (fs.existsSync(manifestPath)) {
    // Read the JS file and extract the default export
    const content = fs.readFileSync(manifestPath, 'utf-8')
    const match = content.match(EXPORT_DEFAULT_OBJECT_REGEX)
    if (match) {
      // Parse the object literal string into an actual object
      const objectStr = match[1].trim()
      const entries = objectStr
        .split(',')
        .map((line) => line.trim())
        .filter((line) => line)
        .map((line) => {
          const [key, value] = line.split(':').map((part) => part.trim())
          const cleanKey = key.replace(/['"]/g, '')
          return [cleanKey, options.path]
        })
      existingManifest = Object.fromEntries(entries)
    }
  }

  // Merge with existing manifest
  const mergedManifest = { ...existingManifest, ...manifest }

  // Generate the JS file content
  const jsContent = `export default {
${Object.entries(mergedManifest)
  .map(([id, filePath]) => `  '${id}': () => import('${filePath}').then(mod => mod.${id})`)
  .join(',\n')}
}
`

  // Write updated manifest
  fs.writeFileSync(manifestPath, jsContent)

  return generate(ast).code
}
