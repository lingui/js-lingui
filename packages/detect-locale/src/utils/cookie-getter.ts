export function getCookie(key: string): string {
  if (!key) {
    return
  }

  // To prevent the for loop in the first place assign an empty array
  // in case there are no cookies at all.
  const cookies = globalThis.document.cookie
    ? globalThis.document.cookie.split("; ")
    : []
  const jar = {}
  for (let i = 0; i < cookies.length; i++) {
    const parts = cookies[i].split("=")
    let value = parts.slice(1).join("=")

    if (value[0] === '"') {
      value = value.slice(1, -1)
    }

    try {
      const foundKey = parts[0].replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
      jar[foundKey] = value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)

      if (key === foundKey) {
        break
      }
    } catch (e) {}
  }

  return key ? jar[key] : jar
}
