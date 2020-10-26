import { LocaleString } from ".."

export default function detectFromStorage(
  key: string,
  options: { sessionStorage: boolean } = { sessionStorage: false }
): LocaleString {
  if (options.sessionStorage) {
    return globalThis.sessionStorage.getItem(key);
  }

  return globalThis.localStorage.getItem(key);
}