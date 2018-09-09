import { createMacro, MacroError } from "babel-plugin-macros"
import Transformer from "./transform"

function index({ references, state, babel }) {
  const { types: t } = babel
  const transformer = new Transformer(babel, { standalone: true })

  for (let [tagName, tags] of Object.entries(references)) {
    tags.forEach(tag => {
      let expression = tag.parentPath

      if (tagName === "t" && t.isCallExpression(expression)) {
        expression = expression.parentPath
      }

      transformer.transform(expression, state.file)
    })
  }
}

const t = () => {}
const plural = () => {}
const select = () => {}
const selectOrdinal = () => {}
const date = () => {}
const number = () => {}

export default createMacro(index)
export { t, plural, select, selectOrdinal, date, number }
