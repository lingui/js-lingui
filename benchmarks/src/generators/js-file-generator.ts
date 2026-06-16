import {
  getMessageAtIndex,
  getVariableDeclarations,
  type MessageEntry,
} from "./message-pool.js"

function renderMessage(msg: MessageEntry, varIdx: number): string {
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
    case "plural": {
      const one = getPluralForm(msg.text, "one")
      const other = getPluralForm(msg.text, "other")
      return `  const msg${varIdx} = plural(count, { one: "${one}", other: "${other}" })`
    }
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
      `// lingui-set context="util-${String(fileIndex).padStart(4, "0")}" comment="Utility messages"`,
    )
  } else if (variant === 5) {
    lines.push(
      `// lingui-set context="service-${String(fileIndex).padStart(4, "0")}"`,
    )
  } else {
    lines.push(
      `// lingui-set context="lib-${String(fileIndex).padStart(4, "0")}" comment="Library strings"`,
    )
  }

  return lines
}

export function generateJsFile(
  fileIndex: number,
  messagesPerFile: number,
): string {
  const padded = String(fileIndex).padStart(4, "0")
  const lines: string[] = []
  const useDirective = hasDirective(fileIndex)

  lines.push(`import { t, plural } from "@lingui/core/macro"`)
  lines.push(``)

  if (useDirective) {
    lines.push(...getDirectiveBlock(fileIndex))
    lines.push(``)
  }

  lines.push(`export function getMessages${padded}() {`)

  for (const decl of getVariableDeclarations()) {
    lines.push(`  ${decl}`)
  }

  // Add mid-file reset for some directive files
  const midPoint = Math.floor(messagesPerFile / 2)

  for (let i = 0; i < messagesPerFile; i++) {
    if (useDirective && fileIndex % 15 === 0 && i === midPoint) {
      lines.push(`  // lingui-reset`)
    }
    const isPlural = i % 10 === 9
    const msg = getMessageAtIndex(fileIndex, i, isPlural)
    lines.push(renderMessage(msg, i))
  }

  lines.push(
    `  return { ${Array.from({ length: messagesPerFile }, (_, i) => `msg${i}`).join(", ")} }`,
  )
  lines.push(`}`)

  return lines.join("\n")
}
