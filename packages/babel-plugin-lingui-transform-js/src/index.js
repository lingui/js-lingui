import 'babel-polyfill'

const pluralRules = ['zero', 'one', 'two', 'few', 'many', 'other']

// Plugin function
export default function ({ types: t }) {
  const isI18nMethod = node =>
    t.isMemberExpression(node.tag) &&
    t.isIdentifier(node.tag.object, { name: 'i18n' }) &&
    t.isIdentifier(node.tag.property, { name: 't' })

  const isChoiceMethod = node =>
    t.isMemberExpression(node) &&
    t.isIdentifier(node.object, { name: 'i18n' }) && (
      t.isIdentifier(node.property, { name: 'plural' }) ||
      t.isIdentifier(node.property, { name: 'select' }) ||
      t.isIdentifier(node.property, { name: 'selectOrdinal' })
    )

  function processMethod (node, file, props) {
    // i18n.t
    if (isI18nMethod(node)) {
      processTemplateLiteral(node.quasi, file, props)

    // i18n.plural and i18n.select
    } else if (isChoiceMethod(node.callee)) {
      const exp = node

      const choices = {}
      const choicesType = node.callee.property.name.toLowerCase()
      let variable
      let offset = ''

      const arg = exp.arguments[0]

      for (const attr of arg.properties) {
        if (attr.computed) {
          throw file.buildCodeFrameError(attr, "Computed properties aren't allowed.")
        }

        const { key } = attr
        // key is either:
        // NumericLiteral => convert to `={number}`
        // StringLiteral => key.value
        // Literal => key.name
        const name = t.isNumericLiteral(key) ? `=${key.value}` : key.name || key.value

        if (name === 'value') {
          const exp = attr.value

          // value must be a variable
          if (!t.isIdentifier(exp)) {
            throw file.buildCodeFrameError(node.callee, 'Value must be a variable.')
          }

          variable = exp.name
          props.params[variable] = t.objectProperty(exp, exp)
        } else if (choicesType !== 'select' && name === 'offset') {
          // offset is static parameter, so it must be either string or number
          if (!t.isNumericLiteral(attr.value) && !t.isStringLiteral(attr.value)) {
            throw file.buildCodeFrameError(node.callee, 'Offset argument cannot be a variable.')
          }
          offset = ` offset:${attr.value.value}`
        } else {
          let value = ''

          if (t.isTemplateLiteral(attr.value)) {
            props = processTemplateLiteral(attr.value, file, Object.assign({}, props, { text: '' }))
            value = props.text
          } else if (t.isCallExpression(attr.value)) {
            props = processMethod(attr.value, file, Object.assign({}, props, { text: '' }))
            value = props.text
          } else {
            value = attr.value.value
          }
          choices[name] = value
        }
      }

      // missing value
      if (!variable) {
        throw file.buildCodeFrameError(node.callee, 'Value argument is missing.')
      }

      const choicesKeys = Object.keys(choices)

      // 'other' choice is required
      if (!choicesKeys.length) {
        throw file.buildCodeFrameError(
          node.callee,
          `Missing ${choicesType} choices. At least fallback argument 'other' is required.`
        )
      } else if (!choicesKeys.includes('other')) {
        throw file.buildCodeFrameError(
          node.callee, `Missing fallback argument 'other'.`)
      }

      // validate plural rules
      if (choicesType === 'plural' || choicesType === 'selectordinal') {
        choicesKeys.forEach(rule => {
          if (!pluralRules.includes(rule) && !/=\d+/.test(rule)) {
            throw file.buildCodeFrameError(
              node.callee,
              `Invalid plural rule '${rule}'. Must be ${pluralRules.join(', ')} or exact number depending on your source language ('one' and 'other' for English).`
            )
          }
        })
      }

      const argument = choicesKeys.map(form => `${form} {${choices[form]}}`).join(' ')
      props.text = `{${variable}, ${choicesType},${offset} ${argument}}`
    }

    return props
  }

  function processTemplateLiteral (exp, file, props) {
    let parts = []

    exp.quasis.forEach((item, index) => {
      parts.push(item)

      if (!item.tail) parts.push(exp.expressions[index])
    })

    parts.forEach((item) => {
      if (t.isTemplateElement(item)) {
        props.text += item.value.raw
      } else if (t.isCallExpression(item)) {
        const { text } = processMethod(item, file, { ...props, text: '' })
        props.text += `{${text}}`
      } else {
        props.text += `{${item.name}}`
        props.params[item.name] = t.objectProperty(item, item)
      }
    })

    return props
  }

  function CallExpression (path, { file }) {
    // 1. Collect all parameters and generate message ID

    const props = processMethod(path.node, file, {
      text: '',
      params: {}
    }, /* root= */true)

    if (!props.text) return

    // 2. Replace complex expression with single call to i18n.t

    const tArgs = [
      t.objectProperty(t.identifier('id'), t.StringLiteral(props.text))
    ]

    const paramsList = Object.values(props.params)
    if (paramsList.length) {
      tArgs.push(
        t.objectProperty(t.identifier('params'), t.objectExpression(paramsList))
      )
    }

    const exp = t.callExpression(
        t.memberExpression(t.identifier('i18n'), t.identifier('t')),
        [ t.objectExpression(tArgs) ]
      )
    exp.loc = path.node.loc
    path.replaceWith(exp)
  }

  return {
    visitor: {
      CallExpression,
      TaggedTemplateExpression: CallExpression
    }
  }
}
