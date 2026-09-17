import {
  defineComponent,
  Fragment,
  h,
  unref,
  type Component,
  type PropType,
  type ShallowRef,
  type Slots,
  type VNodeChild,
} from "vue"
import type { I18n, MessageOptions } from "@lingui/core"
import { formatElements, type TransElement } from "./format"
import { toArray } from "./utils"

export type TransRenderProps = {
  id: string
  translation: VNodeChild
  message?: string | null
}

export type TransRenderCallbackOrComponent =
  | {
      component?: never
      render?: ((props: TransRenderProps) => VNodeChild) | null
    }
  | {
      /**
       * Component (or tag name) rendering the translation. It receives
       * `id`, `message` and `translation` as props (declare them, or set
       * `inheritAttrs: false`) and the translation as its default slot.
       */
      component?: Component | string | null
      render?: never
    }

export type TransProps = {
  id: string
  message?: string
  values?: Record<string, unknown>
  components?: Record<string, TransElement>
  formats?: MessageOptions["formats"]
  comment?: string
  context?: string
} & TransRenderCallbackOrComponent

export type TransLingui = {
  i18n: I18n | ShallowRef<I18n>
  defaultComponent?: Component
}

/**
 * Runtime props definition shared by `Trans` and `TransNoContext`.
 */
export const transProps = {
  id: { type: String, required: true as const },
  message: { type: String, required: false },
  values: {
    type: Object as PropType<Record<string, unknown>>,
    required: false,
  },
  components: {
    type: Object as PropType<Record<string, TransElement>>,
    required: false,
  },
  formats: {
    type: Object as PropType<MessageOptions["formats"]>,
    required: false,
  },
  comment: { type: String, required: false },
  context: { type: String, required: false },
  render: {
    type: Function as unknown as PropType<TransProps["render"]>,
    required: false,
    default: undefined,
  },
  component: {
    type: [Function, Object, String] as PropType<TransProps["component"]>,
    required: false,
    default: undefined,
  },
}

const isComponentLike = (value: unknown): value is Component | string =>
  typeof value === "function" ||
  typeof value === "string" ||
  (typeof value === "object" && value !== null)

/**
 * Render the translation without a wrapping component.
 *
 * Always a Fragment: a component whose root is a bare text node breaks
 * hydration when it sits next to other text nodes (the server serializes
 * them as one text node), fragment markers give Vue the boundary it needs.
 */
const renderBare = (translation: VNodeChild) =>
  h(Fragment, toArray(translation))

function renderWithComponent(
  component: Component | string | undefined,
  i18nProps: TransRenderProps,
  translation: VNodeChild,
): VNodeChild {
  if (component === undefined) {
    return renderBare(translation)
  }

  const children = toArray(translation)

  if (typeof component === "string") {
    return h(component, null, children)
  }

  return h(component, i18nProps, { default: () => children })
}

/**
 * Render a message into VNodes.
 */
export function renderTrans(
  props: TransProps,
  slots: Slots,
  i18n: I18n | undefined,
  defaultComponent?: Component,
): VNodeChild {
  const { render, component, id, message, formats } = props
  const { values, components } = getInterpolationValuesAndComponents(
    props,
    slots,
  )

  const _translation: string =
    i18n && typeof i18n._ === "function"
      ? i18n._(id, values, { message, formats })
      : id

  const translation = _translation
    ? formatElements(_translation, components)
    : null

  if (render === null || component === null) {
    return renderBare(translation)
  }

  const i18nProps: TransRenderProps = {
    id,
    message,
    translation,
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
  } else if (component && !isComponentLike(component)) {
    console.error(
      `Invalid value supplied to prop \`component\`. It must be a Vue component, provided ${component}`,
    )
    return renderWithComponent(defaultComponent, i18nProps, translation)
  }

  // Rendering using a render prop
  if (typeof render === "function") {
    return render(i18nProps)
  }

  // `component` prop has a higher precedence over `defaultComponent`
  return renderWithComponent(
    component || defaultComponent,
    i18nProps,
    translation,
  )
}

export const TransNoContext = defineComponent({
  name: "TransNoContext",
  inheritAttrs: false,
  props: {
    ...transProps,
    lingui: {
      type: Object as PropType<TransLingui>,
      required: true as const,
    },
  },
  setup(props, { slots }) {
    return () =>
      renderTrans(
        props as unknown as TransProps,
        slots,
        unref(props.lingui.i18n),
        props.lingui.defaultComponent,
      )
  },
})

const getInterpolationValuesAndComponents = (
  props: TransProps,
  slots: Slots,
) => {
  const components: Record<string, TransElement> = {
    ...props.components,
  }

  /*
      Named slots are used as element placeholders when `Trans` is compiled
      from a template:

      <Trans>Hello <a href="/docs">docs</a></Trans>

      ↓ ↓ ↓ ↓ ↓ ↓

      <Trans v-bind="{ id, message: 'Hello <0>docs</0>' }">
        <template #0><a href="/docs" /></template>
      </Trans>
    */
  for (const name of Object.keys(slots)) {
    if (name === "default") {
      continue
    }

    const slot = slots[name]
    if (typeof slot !== "function") {
      continue
    }

    const vnodes = slot()
    const [first] = vnodes

    if (vnodes.length === 1 && first !== undefined) {
      components[name] = first
    } else {
      components[name] = h(Fragment, vnodes)
    }
  }

  if (!props.values) {
    return {
      values: undefined,
      components,
    }
  }

  const values = { ...props.values }

  /*
      Replace values placeholders with <INDEX /> and add values to `components`.
      This makes them processed as children and follow JSX semantics.

      Related discussion: https://github.com/lingui/js-lingui/issues/1904

      Another use-case is when VNodes are directly passed as values:

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

      // Vue renders boolean/nullish children as empty output, so keep that
      // behavior without creating placeholder elements that would later warn.
      if (valueForKey == null || typeof valueForKey === "boolean") {
        values[key] = ""
        return
      }

      const index = Object.keys(components).length

      components[index] = h(Fragment, [valueForKey as VNodeChild])
      values[key] = `<${index}/>`
    },
  )

  return { values, components }
}
