// Type-only aliases resolved through the host's `@babel/core`, so the plugin
// follows whichever Babel major is installed. Runtime builders come from the
// `types` object of the Babel plugin API.
import type { types } from "@babel/core"

export type BabelTypes = typeof types

export type CallExpression = types.CallExpression
export type Comment = types.Comment
export type ConditionalExpression = types.ConditionalExpression
export type Expression = types.Expression
export type Identifier = types.Identifier
export type JSXAttribute = types.JSXAttribute
export type JSXElement = types.JSXElement
export type JSXExpressionContainer = types.JSXExpressionContainer
export type JSXIdentifier = types.JSXIdentifier
export type JSXSpreadAttribute = types.JSXSpreadAttribute
export type Literal = types.Literal
export type Node = types.Node
export type ObjectExpression = types.ObjectExpression
export type ObjectProperty = types.ObjectProperty
export type Program = types.Program
export type SourceLocation = types.SourceLocation
export type StringLiteral = types.StringLiteral
export type TemplateLiteral = types.TemplateLiteral
