import { getMessageAtIndex, type MessageEntry } from "./message-pool.js"

function renderMessage(msg: MessageEntry, idx: number): string {
  switch (msg.type) {
    case "simple":
      return `      <Trans>${msg.text}</Trans>`
    case "interpolated": {
      const parts = msg.text.split(/\{(\w+)\}/)
      const jsxContent = parts
        .map((part, i) => (i % 2 === 0 ? part : `{${part}}`))
        .join("")
      return `      <Trans>${jsxContent}</Trans>`
    }
    case "plural":
      return `      <Plural value={count} one="${getPluralForm(msg.text, "one")}" other="${getPluralForm(msg.text, "other")}" />`
  }
}

function getPluralForm(icuText: string, form: string): string {
  const regex = new RegExp(`${form}\\s*\\{([^}]+)\\}`)
  const match = icuText.match(regex)
  return match ? match[1]! : ""
}

export function generateJsxFile(
  fileIndex: number,
  messagesPerFile: number,
): string {
  const padded = String(fileIndex).padStart(4, "0")
  const lines: string[] = []

  lines.push(`import { Trans, Plural } from "@lingui/react/macro"`)
  lines.push(``)
  lines.push(`export default function Component${padded}() {`)
  lines.push(`  const name = "user"`)
  lines.push(`  const username = "admin"`)
  lines.push(`  const count = 5`)
  lines.push(`  const amount = "$99.99"`)
  lines.push(`  const date = "2024-01-01"`)
  lines.push(`  const email = "user@example.com"`)
  lines.push(`  const time = "12:00"`)
  lines.push(`  const team = "Engineering"`)
  lines.push(`  const id = "1234"`)
  lines.push(`  const currency = "USD"`)
  lines.push(`  const current = 1`)
  lines.push(`  const total = 10`)
  lines.push(`  const query = "search"`)
  lines.push(`  const address = "123 Main St"`)
  lines.push(`  const code = "SAVE20"`)
  lines.push(`  const plan = "Pro"`)
  lines.push(`  const filename = "app.ts"`)
  lines.push(`  const line = 42`)
  lines.push(`  return (`)
  lines.push(`    <div>`)

  const globalMsgOffset = fileIndex * messagesPerFile
  for (let i = 0; i < messagesPerFile; i++) {
    const isPlural = i % 10 === 9
    const msg = getMessageAtIndex(globalMsgOffset + i, isPlural)
    lines.push(renderMessage(msg, i))
  }

  lines.push(`    </div>`)
  lines.push(`  )`)
  lines.push(`}`)

  return lines.join("\n")
}
