import path from "path"
import fs from "fs"
import { formatter } from "@lingui/format-po"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import type { CatalogType } from "@lingui/conf"
import { getMessageAtIndex } from "./message-pool.js"
import type { PresetConfig } from "../presets.js"

function getMessageText(
  fileIndex: number,
  msgIndex: number,
  messagesPerFile: number,
): string {
  const globalIdx = fileIndex * messagesPerFile + msgIndex
  const isPlural = msgIndex % 10 === 9
  const msg = getMessageAtIndex(globalIdx, isPlural)

  switch (msg.type) {
    case "simple":
      return msg.text
    case "interpolated":
      return msg.text
    case "plural":
      return msg.text
  }
}

function generateTranslation(text: string, locale: string): string {
  return `[${locale}] ${text}`
}

export function generatePoCatalogs(
  fixturesDir: string,
  preset: PresetConfig,
): void {
  const poFormatter = formatter({ origins: false })
  const totalMessages = preset.files * preset.messagesPerFile
  const existingCount = Math.floor(totalMessages * 0.9)

  const allMessages: { id: string; message: string }[] = []

  for (let fileIdx = 0; fileIdx < preset.files; fileIdx++) {
    for (let msgIdx = 0; msgIdx < preset.messagesPerFile; msgIdx++) {
      const text = getMessageText(fileIdx, msgIdx, preset.messagesPerFile)
      const id = generateMessageId(text)
      allMessages.push({ id, message: text })
    }
  }

  const uniqueMessages = new Map<string, string>()
  for (const { id, message } of allMessages) {
    if (!uniqueMessages.has(id)) {
      uniqueMessages.set(id, message)
    }
  }

  const uniqueEntries = [...uniqueMessages.entries()]
  const existingEntries = uniqueEntries.slice(
    0,
    Math.min(existingCount, uniqueEntries.length),
  )

  for (const locale of preset.locales) {
    const catalog: CatalogType = {}

    for (const [id, message] of existingEntries) {
      catalog[id] = {
        translation:
          locale === "en" ? message : generateTranslation(message, locale),
        message,
        comments: [],
        origin: [],
      }
    }

    const localeDir = path.join(fixturesDir, "locale", locale)
    fs.mkdirSync(localeDir, { recursive: true })

    const filename = path.join(localeDir, "messages.po")
    const content = poFormatter.serialize!(catalog, {
      locale,
      sourceLocale: "en",
      filename,
      existing: undefined,
    })

    fs.writeFileSync(filename, content as string)
  }
}
