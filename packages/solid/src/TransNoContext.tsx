import { createMemo, JSX, ParentComponent } from "solid-js"
import { formatElements } from "./format"
import type { MessageOptions } from "@lingui/core"
import { Dynamic } from "solid-js/web"
import { I18nContext } from "./I18nProvider"

export type TransRenderProps = {
  id: string
  translation: JSX.Element
  children: JSX.Element
  message?: string | null
  /**
   * @deprecated isTranslated prop is undocumented and buggy. It'll be removed in v5 release.
   * */
  isTranslated: boolean
}

export type TransRenderCallbackOrComponent =
  | {
      component?: undefined
      render?:
        | ((props: TransRenderProps) => JSX.Element)
        | null
    }
  | {
      component?: ParentComponent<TransRenderProps> | null
      render?: undefined
    }

export type TransProps = {
  id: string
  message?: string
  values?: Record<string, unknown>
  components?: { [key: string]: JSX.Element | any }
  formats?: MessageOptions["formats"]
  comment?: string
  children?: JSX.Element
} & TransRenderCallbackOrComponent

/**
 * Version of `<Trans>` component without using a Provider/Context SolidJS feature.
 *
 * @experimental the api of this component is not stabilized yet.
 */
export const TransNoContext: ParentComponent<TransProps & {
  lingui: I18nContext
}> = (props) => {
  const translatedContent = createMemo(() => {
    const values = { ...props.values ?? {} };
    const components = { ...props.components ?? {} };

    if (props.values) {
      /*
        Related discussion: https://github.com/lingui/js-lingui/issues/183

        Values *might* contain html elements with static content.
        They're replaced with <INDEX /> placeholders and added to `components`.

        Example:
        Translation: Hello {name}
        Values: { name: <strong>Jane</strong> }

        It'll become "Hello <0 />" with components=[<strong>Jane</strong>]
        */

      Object.keys(props.values).forEach((key) => {
        const value = values[key]
        const index = Object.keys(components).length

        if (_isValidElement(value)) {
          components[index] = value
          values[key] = `<${index}/>`
        }
      })
    }

    const _translation: string =
      props.lingui.i18n != null && typeof props.lingui.i18n()._ === "function"
        ? props.lingui.i18n()._(props.id, values, { message: props.message, formats: props.formats })
        : props.id // i18n provider isn't loaded at all

    const translation = _translation ? formatElements(_translation, components) : null;

    if (props.render === null || props.component === null) {
      // Although `string` is a valid SolidJS element, types only allow `Element`
      // Upstream issue: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20544
      return translation as unknown as JSX.Element
    }

    const FallbackComponent: ParentComponent<TransRenderProps> =
      props.lingui.defaultComponent() || RenderFragment

    const i18nProps: TransRenderProps = {
      id: props.id,
      message: props.message,
      translation,
      // TODO vonovak - remove isTranslated prop in v5 release
      isTranslated: props.id !== translation && props.message !== translation,
      children: translation, // for type-compatibility with `component` prop
    }

//    console.log(props.values, props.components, _translation);

    // Validation of `render` and `component` props
    if (props.render && props.component) {
      console.error(
        "You can't use both `component` and `render` prop at the same time. `component` is ignored."
      )
    } else if (props.render && typeof props.render !== "function") {
      console.error(
        `Invalid value supplied to prop \`render\`. It must be a function, provided ${props.render}`
      )
    } else if (props.component && typeof props.component !== "function") {
      console.error(
        `Invalid value supplied to prop \`component\`. It must be a SolidJS component, provided ${props.component}`
      )
      return <Dynamic component={FallbackComponent} {...i18nProps}>{translation}</Dynamic>
    }

    // Rendering using a render prop
    if (typeof props.render === "function") {
      // Component: render={(props) => <a title={props.translation}>x</a>}
      return props.render(i18nProps)
    }

    // `component` prop has a higher precedence over `defaultComponent`
    const Component: ParentComponent<TransRenderProps> =
      props.component || FallbackComponent

    return <Dynamic component={Component} {...i18nProps}>{translation}</Dynamic>
  })
  return <>{translatedContent()}</>

}

const RenderFragment: ParentComponent<TransRenderProps> = (props) => {
  // cannot use <></> directly because we're passing in props that it doesn't support
  return <>{props.children}</>
}

function _isValidElement(element: unknown): boolean {
  if (Array.isArray(element)) {
    return (element as Array<unknown>).every(_isValidElement);
  }
  return (element instanceof Node);
}
