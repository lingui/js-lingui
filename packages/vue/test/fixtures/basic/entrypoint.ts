import { createSSRApp, h } from "vue"
import { renderToString } from "vue/server-renderer"
import { setupI18n } from "@lingui/core"
import { I18nProvider } from "@lingui/vue"
import App from "./App.vue"

type Props = { name: string; count: number }

function createApp(
  locale: string,
  messages: Record<string, string>,
  props: Props,
) {
  const i18n = setupI18n({ locale, messages: { [locale]: messages } })

  return createSSRApp({
    render: () => h(I18nProvider, { i18n }, { default: () => h(App, props) }),
  })
}

export async function render(
  locale: string,
  messages: Record<string, string>,
  props: Props,
) {
  return renderToString(createApp(locale, messages, props))
}

/**
 * Hydrate server-rendered markup already present in `container`
 */
export function hydrate(
  container: Element,
  locale: string,
  messages: Record<string, string>,
  props: Props,
) {
  return createApp(locale, messages, props).mount(container)
}
