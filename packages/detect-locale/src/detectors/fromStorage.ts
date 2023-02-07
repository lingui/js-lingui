import { LocaleString } from ".."

export default function detectFromStorage(
  key: string,
  options: { useSessionStorage: boolean } = { useSessionStorage: false }
): LocaleString {
  if (options.useSessionStorage) {
    return globalThis.sessionStorage.getItem(key)
  }

  return globalThis.localStorage.getItem(key)
}
