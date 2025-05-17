import { generate } from '@babel/generator'
import { parse } from '@babel/parser'
import traverseImport, { type NodePath, type TraverseOptions } from '@babel/traverse'
import type { CallExpression, Node } from '@babel/types'

// @ts-expect-error
const traverse = traverseImport.default as typeof traverseImport

export const generateAstFromCode = (code: string) => parse(code, { sourceType: 'module', plugins: ['typescript'] })

export const generateCodeFromAst = (ast: Node) => generate(ast)

export const traverseAst = (ast: Node, options: TraverseOptions) => traverse(ast, options)

export const getAssignedVariableName = (path: NodePath<CallExpression>) => {
  const parentPath = path.findParent((parentPath) => parentPath.isVariableDeclarator())
  // @ts-expect-error
  return parentPath?.node.id.type === 'Identifier' ? parentPath.node.id.name : 'unknown'
}

export type { Node } from '@babel/traverse'
