export function normalizePlaceholderValue(text: string) {
  return text.replace(/\n/g, " ").replace(/\s{2,}/g, " ")
}

export function formatPotCreationDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())

  // getTimezoneOffset returns minutes *behind* UTC
  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? "+" : "-"
  const abs = Math.abs(offsetMinutes)
  const offsetH = pad(Math.floor(abs / 60))
  const offsetM = pad(abs % 60)

  return `${year}-${month}-${day} ${hour}:${minute}${sign}${offsetH}${offsetM}`
}
