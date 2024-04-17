/// <reference types="react/canary" />
/**
 * This is an entry point for React Server Components (RSC)
 *
 * RSC uses static analysis to find any non-valid function calls in the import graph.
 * That means this entry point and its children must not have any Provider/Context calls.
 */
import type { I18nContext } from "./I18nProvider"

export { TransNoContext } from "./TransNoContext"
export type {
  TransProps,
  TransRenderProps,
  TransRenderCallbackOrComponent,
} from "./TransNoContext"

import type { I18n } from "@lingui/core"
import React from "react"

type CtxValueRef = { current: I18nContext | null }
let cache: (() => CtxValueRef) | null = null

const getLinguiCache = () => {
  // make lazy initialization of React.cache
  // so it will not execute when module just imported
  if (!cache) {
    cache = React.cache(
      (): CtxValueRef => ({
        current: null,
      })
    )
  }

  return cache()
}

/**
 * Set Lingui's i18n instance for later use in RSC Components
 *
 * Example:
 *
 * ```js
 * import { setupI18n } from "@lingui/core";
 *
 * const i18n = setupI18n({
 *   locale,
 *   messages: { [locale]: messages },
 * })
 *
 * setI18n(i18n);
 * ```
 */
export function setI18n(
  i18n: I18n,
  defaultComponent?: I18nContext["defaultComponent"]
) {
  getLinguiCache().current = {
    i18n,
    _: i18n._.bind(i18n),
    defaultComponent,
  }
}

/**
 * Get Lingui's i18n instance saved for RSC
 *
 * ```js
 * export function generateMetadata() {
 *   const i18n = getI18n()
 *
 *   return {
 *     title: t(i18n)`Translation Demo`,
 *   }
 * }
 * ```
 */
export function getI18n(): I18nContext | null {
  return getLinguiCache()?.current
}
