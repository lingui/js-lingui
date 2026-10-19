import { triggerRef, type Plugin } from "vue"
import type { I18n } from "@lingui/core"
import {
  createI18nContext,
  LinguiInjectionKey,
  type I18nDefaultComponent,
} from "./I18nProvider"

export type LinguiPluginOptions = {
  i18n: I18n
  defaultComponent?: I18nDefaultComponent
}

/**
 * Vue plugin alternative to the `I18nProvider` component:
 *
 * ```ts
 * app.use(createLingui({ i18n }))
 * ```
 *
 * Unlike `I18nProvider`, it does not wait for `i18n.activate()` before
 * rendering the application.
 */
export function createLingui(options: LinguiPluginOptions): Plugin {
  return {
    install(app) {
      const { context, i18nRef } = createI18nContext(
        options.i18n,
        () => options.defaultComponent,
      )

      const unsubscribe = options.i18n.on("change", () => triggerRef(i18nRef))

      // Release the listener when the app is unmounted, otherwise every app
      // created against a shared `i18n` instance (SSR per request, tests)
      // would keep one forever.
      if (typeof app.onUnmount === "function") {
        app.onUnmount(unsubscribe)
      } else {
        // Vue < 3.5
        const unmount = app.unmount
        app.unmount = function () {
          unsubscribe()
          return unmount.call(this)
        }
      }

      app.provide(LinguiInjectionKey, context)
    },
  }
}
