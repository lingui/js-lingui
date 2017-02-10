import "babel-polyfill"


const mergeProps = (props, nextProps) => ({
  text: props.text + nextProps.text,
  params: Object.assign({}, props.params, nextProps.params),
  elementIndex: nextProps.elementIndex
})

const elementGeneratorFactory = () => {
  let index = 0
  return () => index++
}


// Plugin function
export default function({ types: t }) {
  let elementGenerator

  const methodName = name => node =>
    t.isMemberExpression(node.tag) &&
    t.isIdentifier(node.tag.object, { name: 'i18n' }) &&
    t.isIdentifier(node.tag.property, { name })

  const isI18nMethod = methodName('t')

  function processElement(node, props, root = false) {
    // i18n.t
    if (isI18nMethod(node)) {
      const exp = node.quasi
      let parts = []

      exp.quasis.forEach((item, index) => {
        parts.push(item)

        if (!item.tail) parts.push(exp.expressions[index])
      })

      parts.forEach((item) => {
        if (t.isTemplateElement(item)) {
          props.text += item.value.raw
        } else {
          props.text += `{${item.name}}`
          props.params[item.name] = t.objectProperty(item, item)
        }
      })
    }

    return props
  }

  return {
    visitor: {
      TaggedTemplateExpression(path) {
        elementGenerator = elementGeneratorFactory()

        // 1. Collect all parameters and generate message ID

        const props = processElement(path.node, {
          text: "",
          params: {}
        }, /* root= */true)

        if (!props) return

        console.log(props)

        // 2. Replace complex expression with single call to i18n.t

        const tArgs = [
          t.objectProperty(t.identifier('id'), t.StringLiteral(props.text)),
        ]

        const paramsList = Object.values(props.params)
        if (paramsList.length) {
          tArgs.push(
            t.objectProperty(t.identifier('params'), t.objectExpression(paramsList))
          )
        }

        path.replaceWith(
          t.callExpression(
            t.memberExpression(t.identifier('i18n'), t.identifier('t')),
            [ t.objectExpression(tArgs) ]
          )
        )
      }
    }  // visitor
  }
}
