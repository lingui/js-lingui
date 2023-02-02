import { LocaleString } from ".."

type IE11NavigatorLanguage = {
  userLanguage?: string
}

export default function detectFromNavigator(
  navigator: Partial<Navigator & IE11NavigatorLanguage> = globalThis.navigator
): LocaleString {
  const result: LocaleString = navigator.language || navigator.userLanguage
  return result
}
