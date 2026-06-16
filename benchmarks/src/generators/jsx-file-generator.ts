import {
  getMessageAtIndex,
  getVariableDeclarations,
  type MessageEntry,
} from "./message-pool.js"

function renderTransMessage(msg: MessageEntry): string {
  switch (msg.type) {
    case "simple":
      return `      <Trans>${msg.text}</Trans>`
    case "interpolated": {
      const parts = msg.text.split(/\{(\w+)\}/)
      const jsxContent = parts
        .map((part, i) => {
          if (i % 2 === 0) return part
          const varDef = msg.vars.find((v) => v.name === part)
          return varDef ? `{${varDef.expr}}` : `{${part}}`
        })
        .join("")
      return `      <Trans>${jsxContent}</Trans>`
    }
    case "plural":
      return `      <Plural value={count} one="${getPluralForm(msg.text, "one")}" other="${getPluralForm(msg.text, "other")}" />`
  }
}

function renderHookMessage(msg: MessageEntry, varIdx: number): string {
  switch (msg.type) {
    case "simple":
      return `  const msg${varIdx} = t\`${msg.text}\``
    case "interpolated": {
      const templateStr = msg.text.replace(/\{(\w+)\}/g, (_, name) => {
        const varDef = msg.vars.find((v) => v.name === name)
        return `\${${varDef ? varDef.expr : name}}`
      })
      return `  const msg${varIdx} = t\`${templateStr}\``
    }
    case "plural":
      return `  const msg${varIdx} = t\`${msg.text}\``
  }
}

function getPluralForm(icuText: string, form: string): string {
  const regex = new RegExp(`${form}\\s*\\{([^}]+)\\}`)
  const match = icuText.match(regex)
  return match ? match[1]! : ""
}

function hasDirective(fileIndex: number): boolean {
  return fileIndex % 5 === 0
}

function getDirectiveBlock(fileIndex: number): string[] {
  const lines: string[] = []
  const variant = fileIndex % 15

  if (variant === 0) {
    lines.push(
      `// lingui-set context="section-${String(fileIndex).padStart(4, "0")}" comment="Auto-generated section"`,
    )
  } else if (variant === 5) {
    lines.push(
      `// lingui-set context="page-${String(fileIndex).padStart(4, "0")}"`,
    )
  } else {
    lines.push(
      `// lingui-set context="module-${String(fileIndex).padStart(4, "0")}" comment="Component messages"`,
    )
  }

  return lines
}

export function generateJsxFile(
  fileIndex: number,
  messagesPerFile: number,
): string {
  const padded = String(fileIndex).padStart(4, "0")
  const lines: string[] = []
  const useDirective = hasDirective(fileIndex)

  lines.push(`import { Trans, Plural } from "@lingui/react/macro"`)
  lines.push(`import { useLingui } from "@lingui/react/macro"`)
  lines.push(``)

  if (useDirective) {
    lines.push(...getDirectiveBlock(fileIndex))
    lines.push(``)
  }

  lines.push(`export default function Component${padded}() {`)
  lines.push(`  const { t } = useLingui()`)

  for (const decl of getVariableDeclarations()) {
    lines.push(`  ${decl}`)
  }

  // Collect hook-based messages (rendered before the return)
  const hookMessages: string[] = []
  const transMessages: string[] = []

  for (let i = 0; i < messagesPerFile; i++) {
    const isPlural = i % 10 === 9
    const msg = getMessageAtIndex(fileIndex, i, isPlural)
    const useHook = i % 3 === 0

    if (useHook && msg.type !== "plural") {
      hookMessages.push(renderHookMessage(msg, i))
    } else {
      transMessages.push(renderTransMessage(msg))
    }
  }

  // Add mid-file reset for some directive files
  if (useDirective && fileIndex % 15 === 0 && messagesPerFile > 5) {
    const midPoint = Math.floor(transMessages.length / 2)
    transMessages.splice(midPoint, 0, `      {/* lingui-reset */}`)
  }

  for (const hm of hookMessages) {
    lines.push(hm)
  }

  lines.push(`  return (`)
  lines.push(`    <div>`)

  for (const hm of hookMessages) {
    const match = hm.match(/const (msg\d+)/)
    if (match) lines.push(`      <span>{${match[1]}}</span>`)
  }

  for (const tm of transMessages) {
    lines.push(tm)
  }

  lines.push(`    </div>`)
  lines.push(`  )`)
  lines.push(`}`)

  return lines.join("\n")
}
