import {
  createComponent,
  createEffect,
  createMemo,
  type Accessor,
  type Component,
  type JSXElement,
  type ParentComponent,
} from "solid-js"
import type { I18n, MessageOptions } from "@lingui/core"
import { formatElements } from "./format"

export type TransRenderProps = {
  id: string
  translation: JSXElement
  children: JSXElement
  message?: string | null
}

export type TransRenderCallbackOrComponent =
  | {
      component?: never
      render?: ((props: TransRenderProps) => JSXElement) | null
    }
  | {
      component?: Component<TransRenderProps> | null
      render?: never
    }

export type TransProps = {
  id: string
  message?: string
  values?: Record<string, unknown>
  components?: Record<string, ParentComponent>
  formats?: MessageOptions["formats"]
  comment?: string
} & TransRenderCallbackOrComponent

export function TransNoContext(
  props: TransProps & {
    lingui: {
      i18n: Accessor<I18n>
      defaultComponent?: Accessor<Component<TransRenderProps> | undefined>
    }
  },
): JSXElement {
  const translation = createMemo(() => {
    const { values, components } = getInterpolationValuesAndComponents(props)
    const i18n = props.lingui.i18n()
    const _translation =
      i18n != null && typeof i18n._ === "function"
        ? i18n._(props.id, values, {
            message: props.message,
            formats: props.formats,
          })
        : props.id

    const translation = _translation
      ? formatElements(_translation, components)
      : null

    return translation as JSXElement
  })

  const FallbackComponent = createMemo<Component<TransRenderProps>>(() => {
    return props.lingui.defaultComponent?.() || RenderChildren
  })

  const i18nProps: TransRenderProps = {
    get id() {
      return props.id
    },
    get message() {
      return props.message
    },
    get translation() {
      return translation()
    },
    get children() {
      return translation()
    },
  }

  createEffect(() => {
    const render = props.render
    const component = props.component

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
      console.error(
        `Invalid value supplied to prop \`component\`. It must be a Solid component, provided ${component}`,
      )
    }
  })

  const renderPropOutput = createMemo(() => {
    if (typeof props.render === "function") {
      // Rendering using a render prop
      return props.render(i18nProps)
    }

    return null
  })

  const Component = createMemo<Component<TransRenderProps>>(() => {
    if (props.component && typeof props.component !== "function") {
      return FallbackComponent()
    }

    // `component` prop has a higher precedence over `defaultComponent`
    return props.component || FallbackComponent()
  })

  const content = createMemo(() => {
    if (props.render === null || props.component === null) {
      return translation()
    }

    if (typeof props.render === "function") {
      return renderPropOutput()
    }

    return createComponent(Component(), i18nProps)
  })

  return <>{content()}</>
}

const RenderChildren: Component<TransRenderProps> = (props) => {
  return <>{props.children}</>
}

const getInterpolationValuesAndComponents = (props: TransProps) => {
  if (!props.values) {
    return {
      values: undefined,
      components: props.components,
    }
  }

  const values = { ...props.values }
  const components: Record<string, ParentComponent> = {
    ...props.components,
  }

  /*
      Replace values placeholders with <INDEX /> and add values to `components`.
      This makes them processed as JSX children and follow JSX semantics.

      Related discussion: https://github.com/lingui/js-lingui/issues/1904

      Another use-case is when Solid components are directly passed as values:

      Example:
      Translation: 'Hello {name}'
      Values: { name: <strong>Jane</strong> }

      It'll become "Hello <0 />" with components=[<strong>Jane</strong>]

      Related discussion: https://github.com/lingui/js-lingui/issues/183
    */
  Object.entries(props.values).forEach(
    ([key, valueForKey]: [string, unknown]) => {
      // simple scalars should be processed as values to be able to apply formatting
      if (typeof valueForKey === "string" || typeof valueForKey === "number") {
        return
      }

      // Solid renders boolean/nullish children as empty output, so keep that
      // behavior without creating placeholder elements that would later warn.
      if (valueForKey == null || typeof valueForKey === "boolean") {
        values[key] = ""
        return
      }

      const index = Object.keys(components).length

      components[index] = () => <>{valueForKey}</>
      values[key] = `<${index}/>`
    },
  )

  return { values, components }
}
