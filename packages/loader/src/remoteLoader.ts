import R from "ramda"
import { getConfig } from "@lingui/conf"
import { createCompiledCatalog, getFormat } from "@lingui/cli/api"

type RemoteLoaderMessages<T> = string | Record<string, any> | T

export function remoteLoader<T>(locale: string, messages: RemoteLoaderMessages<T>, fallbackMessages?: RemoteLoaderMessages<T>) {
  const config = getConfig()

  // When format is minimal, everything works fine because are .json files,
  // but when is csv, .po, .po-gettext needs to be parsed to something interpretable
  let parsedMessages;
  let parsedFallbackMessages;
  if (config.format) {
    const formatter = getFormat(config.format)
    if (fallbackMessages) {
      // we do this because, people could just import the fallback and import the ./en/messages.js
      // generated by lingui and the use case of format .po but fallback as .json module could be perfectly valid
      parsedFallbackMessages = typeof fallbackMessages === "object" ? getFormat("minimal").parse(fallbackMessages) : formatter.parse(fallbackMessages)
    }

    parsedMessages = formatter.parse(messages)
  } else {
    throw new Error(`
        *format* value in the Lingui configuration is required to make this loader 100% functional
        Read more about this here: https://lingui.js.org/ref/conf.html#format
      `)
  }


  const mapTranslationsToInterporlatedString = R.mapObjIndexed(
    (_, key) => {
      // if there's fallback and translation is empty, return the fallback
      if (parsedMessages[key].translation === "" && parsedFallbackMessages?.[key]?.translation) {
        return parsedFallbackMessages[key].translation
      }

      return parsedMessages[key].translation
    },
    parsedMessages
  )

  // In production we don't want untranslated strings. It's better to use message
  // keys as a last resort.
  // In development, however, we want to catch missing strings with `missing` parameter
  // of I18nProvider (React) or setupI18n (core) and therefore we need to get
  // empty translations if missing.
  const strict = process.env.NODE_ENV !== "production"
  return createCompiledCatalog(locale, mapTranslationsToInterporlatedString, {
    strict,
    ...config,
    namespace: config.compileNamespace,
    pseudoLocale: config.pseudoLocale,
  })

}

