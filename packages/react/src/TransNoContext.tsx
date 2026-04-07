import { formatElements } from "./format"
import type { I18n, MessageOptions, MessageValue, Values } from "@lingui/core"
import { isValidElement } from "react"

export type TransRenderProps = {
  id: string
  translation: React.ReactNode
  children: React.ReactNode
  message?: string | null
}

export type TransRenderCallbackOrComponent =
  | {
      component?: never
      render?:
        | ((props: TransRenderProps) => React.ReactElement<any, any>)
        | null
    }
  | {
      component?: React.ComponentType<TransRenderProps> | null
      render?: never
    }

type JSXChildValue =
  | React.ReactElement
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly JSXChildValue[]

export type TransValue = MessageValue | JSXChildValue
export type TransValues = Record<string, TransValue>

export type TransProps = {
  id: string
  message?: string
  values?: TransValues
  components?: { [key: string]: React.ElementType | any }
  formats?: MessageOptions["formats"]
  comment?: string
} & TransRenderCallbackOrComponent

/**
 * Version of `<Trans>` component without using a Provider/Context React feature.
 * Primarily made for support React Server Components (RSC)
 *
 * @experimental the api of this component is not stabilized yet.
 */
export function TransNoContext(
  props: TransProps & {
    lingui: {
      i18n: I18n
      defaultComponent?: React.ComponentType<TransRenderProps>
    }
  },
): React.ReactElement<any, any> | null {
  const {
    render,
    component,
    id,
    message,
    formats,
    lingui: { i18n, defaultComponent },
  } = props

  const { values, components } = getInterpolationValuesAndComponents(props)

  const _translation: string =
    i18n && typeof i18n._ === "function"
      ? i18n._(id, values, { message, formats })
      : id // i18n provider isn't loaded at all

  const translation = _translation
    ? formatElements(_translation, components)
    : null

  if (render === null || component === null) {
    // Although `string` is a valid react element, types only allow `Element`
    // Upstream issue: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20544
    return translation as unknown as React.ReactElement<any, any>
  }

  const FallbackComponent: React.ComponentType<TransRenderProps> =
    defaultComponent || RenderChildren

  const i18nProps: TransRenderProps = {
    id,
    message,
    translation,
    children: translation, // for type-compatibility with `component` prop
  }

  // Validation of `render` and `component` props
  if (render && component) {
    console.error(
      "You can't use both `component` and `render` prop at the same time. `component` is ignored.",
    )
  } else if (render && typeof render !== "function") {
    console.error(
      `Invalid value supplied to prop \`render\`. It must be a function, provided ${render}`,
    )
  } else if (component && typeof component !== "function") {
    // Apparently, both function components and class components are functions
    // See https://stackoverflow.com/a/41658173/1535540
    console.error(
      `Invalid value supplied to prop \`component\`. It must be a React component, provided ${component}`,
    )

    return <FallbackComponent {...i18nProps}>{translation}</FallbackComponent>
  }

  // Rendering using a render prop
  if (typeof render === "function") {
    // Component: render={(props) => <a title={props.translation}>x</a>}
    return render(i18nProps)
  }

  // `component` prop has a higher precedence over `defaultComponent`
  const Component: React.ComponentType<TransRenderProps> =
    component || FallbackComponent

  return <Component {...i18nProps}>{translation}</Component>
}

const RenderChildren = ({ children }: TransRenderProps) => {
  return children
}

const getInterpolationValuesAndComponents = (
  props: TransProps,
): {
  values: Values | undefined
  components: TransProps["components"]
} => {
  if (!props.values) {
    return {
      values: undefined,
      components: props.components,
    }
  }

  const values: Values = Object.create(null)
  const components = { ...props.components }
  let nextIndex = Object.keys(components).length
  /*
      Replace values placeholders with <INDEX /> and add values to `components`.
      This makes them processed as JSX children and follow JSX semantics.

      Related discussion: https://github.com/lingui/js-lingui/issues/1904

      Another use-case is when React components are directly passed as values:

      Example:
      Translation: 'Hello {name}'
      Values: { name: <strong>Jane</strong> }

      It'll become "Hello <0 />" with components=[<strong>Jane</strong>]

      Related discussion: https://github.com/lingui/js-lingui/issues/183
    */
  Object.entries(props.values).forEach(([key, valueForKey]) => {
    // Preserve non-React values instead of converting them into JSX placeholders.
    if (!isPlaceholderValue(valueForKey)) {
      values[key] = valueForKey
      return
    }
    // React elements, arrays, and nullish values should be processed as JSX children
    components[nextIndex] = <>{valueForKey}</>
    values[key] = `<${nextIndex}/>`
    nextIndex += 1
  })
  return { values, components }
}

function isJSXChildValue(value: unknown): value is JSXChildValue {
  if (
    value == null ||
    typeof value === "boolean" ||
    typeof value === "string" ||
    typeof value === "number" ||
    isValidElement(value)
  ) {
    return true
  }

  return Array.isArray(value) && value.every(isJSXChildValue)
}

function isPlaceholderValue(
  value: TransValue,
): value is Exclude<JSXChildValue, string | number> {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return false
  }

  return isJSXChildValue(value)
}
