/// <reference types="react/canary" />
/**
 * This is an entry point for React Server Components (RSC)
 *
 * The RSC uses a static analysis to find any non-valid function calls in the import graph.
 * That means this entry point and it's children should not have any Provider/Context calls.
 */
export { TransNoContext } from "./TransNoContext"
export type {
  TransProps,
  TransRenderProps,
  TransRenderCallbackOrComponent,
} from "./TransNoContext"

import type { I18n } from "@lingui/core"
import React from "react"

let cache: (() => { current: I18n | null }) | null = null

const getLinguiCache = () => {
  // make lazy initialization of React.cache
  // so it will not execute when module just imported
  if (!cache) {
    cache = React.cache((): { current: I18n | null } => ({
      current: null,
    }))
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
export function setI18n(i18n: I18n) {
  getLinguiCache().current = i18n
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
export function getI18n(): I18n | null {
  return getLinguiCache().current
}
