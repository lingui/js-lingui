import { Messages, setupI18n } from "@lingui/core"
import { useRouter } from "next/router"
import { useMemo } from "react"

/**
 * Load the catalog for the requested locale.
 *
 * `@lingui/loader` compiles the `.po` file at build time, so the import
 * resolves to the compiled messages.
 */
export async function loadCatalog(locale: string): Promise<Messages> {
  const { messages } = await import(`./locales/${locale}.po`)
  return messages
}

/**
 * Create the I18n instance for the active locale from the catalog that
 * `getStaticProps` put into the page props.
 */
export function useLinguiInit(messages: Messages) {
  const router = useRouter()
  // Always set, because `i18n` is configured in next.config.ts
  const locale = router.locale!

  // A new instance is only needed when the locale or its catalog changes
  return useMemo(
    () => setupI18n({ locale, messages: { [locale]: messages } }),
    [locale, messages]
  )
}
