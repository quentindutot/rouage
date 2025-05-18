import fs from 'node:fs'
import path from 'node:path'
import {
  type Node,
  generateAstFromCode,
  generateCodeFromAst,
  getAssignedVariableName,
  traverseAst,
} from './babel-helpers.js'

export const processServerFunctions = (options: {
  code: string
  path: string
  template: (sfnId: string) => string
}) => {
  const ast = generateAstFromCode(options.code)

  applyServerFunctionTemplate(ast, options.template)
  generateServerFunctionManifest(ast, options.path)

  return generateCodeFromAst(ast)
}

const applyServerFunctionTemplate = (ast: Node, template: (serverFunctionId: string) => string) => {
  return traverseAst(ast, {
    // biome-ignore lint/style/useNamingConvention: <explanation>
    CallExpression(path) {
      const callee = path.node.callee
      if (callee.type === 'Identifier' && callee.name === 'createServerFunction' && path.node.arguments.length === 1) {
        const functionArg = path.node.arguments[0]
        if (
          functionArg &&
          (functionArg.type === 'ArrowFunctionExpression' || functionArg.type === 'FunctionExpression')
        ) {
          functionArg.body = generateAstFromCode(
            `async () => {${template(getAssignedVariableName(path))}}`,
            // @ts-expect-error
          ).program.body[0].expression.body
          functionArg.async = true
        }
      }
    },
  })
}

const generateServerFunctionManifest = (ast: Node, filePath: string) => {
  const foundServerFunctions: Record<string, string> = {}
  traverseAst(ast, {
    // biome-ignore lint/style/useNamingConvention: <explanation>
    CallExpression(path) {
      const callee = path.node.callee
      if (callee.type === 'Identifier' && callee.name === 'createServerFunction' && path.node.arguments.length === 1) {
        const id = getAssignedVariableName(path)
        foundServerFunctions[id] = filePath
      }
    },
  })
  if (Object.keys(foundServerFunctions).length === 0) {
    return
  }

  const manifestPath = path.join(process.cwd(), 'node_modules', '.rouage', 'server-functions.js')
  const manifestDir = path.dirname(manifestPath)
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true })
  }

  // Read existing manifest if it exists
  const existingManifest: Record<string, string> = {}
  if (fs.existsSync(manifestPath)) {
    const content = fs.readFileSync(manifestPath, 'utf-8')
    const manifestAst = generateAstFromCode(content)

    traverseAst(manifestAst, {
      // biome-ignore lint/style/useNamingConvention: <explanation>
      ObjectExpression(path) {
        if (path.parent.type === 'ExportDefaultDeclaration') {
          for (const prop of path.node.properties) {
            if (prop.type === 'ObjectProperty' && prop.key.type === 'StringLiteral') {
              // @ts-expect-error
              existingManifest[prop.key.value] = prop.value.value
            }
          }
        }
      },
    })
  }

  // Merge with existing manifest
  const mergedManifest = { ...existingManifest, ...foundServerFunctions }

  // Generate new manifest AST
  const manifestObjectProperties = Object.entries(mergedManifest).map(([id, filePath]) => {
    return {
      type: 'ObjectProperty',
      key: {
        type: 'StringLiteral',
        value: id,
      },
      value: {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'import',
              },
              arguments: [
                {
                  type: 'StringLiteral',
                  value: filePath,
                },
              ],
            },
            property: {
              type: 'Identifier',
              name: 'then',
            },
          },
          arguments: [
            {
              type: 'ArrowFunctionExpression',
              params: [
                {
                  type: 'Identifier',
                  name: 'mod',
                },
              ],
              body: {
                type: 'MemberExpression',
                object: {
                  type: 'Identifier',
                  name: 'mod',
                },
                property: {
                  type: 'Identifier',
                  name: id,
                },
              },
            },
          ],
        },
      },
    }
  })

  const manifestAst = {
    type: 'Program',
    body: [
      {
        type: 'ExportDefaultDeclaration',
        declaration: {
          type: 'ObjectExpression',
          properties: manifestObjectProperties,
        },
      },
    ],
    sourceType: 'module',
  }

  // @ts-expect-error
  fs.writeFileSync(manifestPath, generateCodeFromAst(manifestAst).code)
}
