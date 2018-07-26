import Transformer from "./transformer"

// Plugin function
export default function(babel) {
  const { types: t } = babel

  const transformer = new Transformer(babel)

  return {
    visitor: {
      CallExpression: transformer.transform,
      TaggedTemplateExpression: transformer.transform
    }
  }
}
