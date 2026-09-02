/// <reference types="react/canary" />
/**
 * This is an entry point for React Server Components (RSC)
 *
 * RSC uses static analysis to find any non-valid function calls in the import graph.
 * That means this entry point and its children must not have any Provider/Context calls.
 */
import type { I18nContext } from "./I18nProvider"

export type { I18nContext } from "./I18nProvider"

export { TransNoContext } from "./TransNoContext"
export type {
  TransProps,
  TransRenderProps,
  TransRenderCallbackOrComponent,
} from "./TransNoContext"

import type { I18n } from "@lingui/core"
import { AsyncLocalStorage } from "node:async_hooks"
import React from "react"

type CtxValueRef = { current: I18nContext | null }

let cache: (() => CtxValueRef) | null = null
let serverFunctionStorage: AsyncLocalStorage<I18nContext> | undefined
let didWarnAboutSetI18nOutsideRsc = false

const getLinguiCacheIfAvailable = () => {
  // Lazily wrap the ref factory in `React.cache` on first use, so it doesn't
  // run when the module is merely imported.
  if (!cache) {
    cache = React.cache((): CtxValueRef => ({
      current: null,
    }))
  }

  // Detect an active RSC render: inside one, `React.cache` memoizes and both
  // calls return the same ref. Outside a render it doesn't, so the refs differ
  // and we fall back to the Server Function `AsyncLocalStorage` context.
  const cacheRef = cache()

  return cache() === cacheRef ? cacheRef : null
}

const createLinguiContext = (
  i18n: I18n,
  defaultComponent?: I18nContext["defaultComponent"],
): I18nContext => ({
  i18n,
  _: i18n.t,
  defaultComponent,
})

const getServerFunctionStorage = () => {
  if (!serverFunctionStorage) {
    serverFunctionStorage = new AsyncLocalStorage<I18nContext>()
  }

  return serverFunctionStorage
}

/**
 * Set Lingui's i18n instance for later use in React Server Components.
 *
 * This function only stores the instance during a Server Component render.
 * Use {@link runWithI18n} to scope an instance to a Server Function.
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
  defaultComponent?: I18nContext["defaultComponent"],
) {
  const cacheRef = getLinguiCacheIfAvailable()

  if (!cacheRef) {
    if (
      process.env.NODE_ENV !== "production" &&
      !didWarnAboutSetI18nOutsideRsc
    ) {
      didWarnAboutSetI18nOutsideRsc = true
      console.warn(
        "Lingui: `setI18n` only works during a React Server Component render. " +
          "Use `runWithI18n` in a Server Function.",
      )
    }

    return
  }

  cacheRef.current = createLinguiContext(i18n, defaultComponent)
}

/**
 * Run a callback with Lingui's i18n instance available to Server Functions
 * and asynchronous operations created within the callback, outside an RSC
 * render. A nested RSC render uses its own context set by {@link setI18n}.
 *
 * The caller's context is restored when the callback returns. If the callback
 * returns a native promise, its asynchronous execution keeps the scoped context.
 *
 * Works in any runtime that provides `AsyncLocalStorage` from `node:async_hooks`:
 * Node.js, the Vercel Edge Runtime, and Cloudflare Workers (with the
 * `nodejs_compat` or `nodejs_als` compatibility flag enabled).
 */
export function runWithI18n<Result>(
  i18n: I18n,
  callback: () => Result,
  defaultComponent?: I18nContext["defaultComponent"],
): Result {
  return getServerFunctionStorage().run(
    createLinguiContext(i18n, defaultComponent),
    callback,
  )
}

/**
 * Get the Lingui context saved for React Server Components and Server Functions.
 * Returns `null` when no context has been initialized.
 *
 * ```js
 * import { msg } from "@lingui/core/macro"
 *
 * function getPageTitle() {
 *   const { i18n } = getI18nOrThrow()
 *   return i18n.t(msg`Translation Demo`)
 * }
 * ```
 */
export function getI18n(): I18nContext | null {
  const cacheRef = getLinguiCacheIfAvailable()

  if (cacheRef) {
    return cacheRef.current
  }

  return getServerFunctionStorage().getStore() ?? null
}

/**
 * Get the current Lingui context or throw an actionable initialization error.
 *
 * Use this in code where a missing context is a programming error. Use
 * {@link getI18n} when the caller needs to handle an absent context itself.
 */
export function getI18nOrThrow(): I18nContext {
  const context = getI18n()

  if (!context) {
    throw new Error(
      "Lingui: i18n context is not initialized. " +
        "Call `setI18n` during a React Server Component render. In a Server Function, wrap the handler with `runWithI18n`.",
    )
  }

  return context
}
