export function normalizePlaceholderValue(text: string) {
  return text.replace(/\n/g, " ").replace(/\s{2,}/g, " ")
}
