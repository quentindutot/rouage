import { generate } from '@babel/generator'
import { parse } from '@babel/parser'
import traverseImport from '@babel/traverse'

// @ts-expect-error
const traverse = traverseImport.default as typeof traverseImport

export const transformServerFunction = (options: {
  code: string
  path: string
  template: (sfnId: string) => string
}) => {
  const ast = parse(options.code, { sourceType: 'module', plugins: ['typescript'] })

  traverse(ast, {
    // biome-ignore lint/style/useNamingConvention: <explanation>
    CallExpression(path) {
      const callee = path.node.callee
      if (callee.type === 'Identifier' && callee.name === 'createServerFunction' && path.node.arguments.length >= 2) {
        // First arg: should be function name (id)
        const idArg = path.node.arguments[0]
        let id: string | null = null
        if (idArg.type === 'StringLiteral') {
          id = idArg.value
        } else {
          // fallback for non-string
          id = 'unknown'
        }

        // Second arg: should be function expression
        const fnArg = path.node.arguments[1]
        if (fnArg && (fnArg.type === 'ArrowFunctionExpression' || fnArg.type === 'FunctionExpression')) {
          // @ts-expect-error
          fnArg.body = parse(`async () => {${options.template(id)}}`).program.body[0].expression.body
          fnArg.async = true
        }
      }
    },
  })

  return generate(ast).code
}
