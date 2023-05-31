import { program } from "commander"

import {
  CatalogType,
  ExtractedMessageType,
  getConfig,
  LinguiConfigNormalized,
  MessageType,
} from "@lingui/conf"

import { getCatalogs } from "@lingui/cli/api"
import { formatter as createFormatter } from "@lingui/format-po"
import fs from "fs/promises"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"

function _isGeneratedId(id: string, message: ExtractedMessageType): boolean {
  return id === generateMessageId(message.message, message.context)
}

export default async function command(
  config: LinguiConfigNormalized
): Promise<boolean> {
  const catalogs = await getCatalogs(config)

  let commandSuccess = true
  const formatter = createFormatter({
    explicitIdAsDefault: true,
  })

  await Promise.all(
    catalogs.map(async (catalog) => {
      const extractedCatalog = await catalog.collect()

      for (const locale of config.locales) {
        const translationFileName = catalog.getFilename(locale)

        const translationCatalog = await formatter.parse(
          await fs.readFile(translationFileName, "utf-8"),
          {
            locale,
            sourceLocale: config.sourceLocale,
            filename: translationFileName,
          }
        )

        for (const messageId in extractedCatalog) {
          const extractedMessage = extractedCatalog[messageId]

          const isGeneratedId = _isGeneratedId(messageId, extractedMessage)
          const oldId = isGeneratedId ? extractedMessage.message : messageId

          if (translationCatalog[oldId]) {
            ;(extractedMessage as MessageType).translation =
              translationCatalog[oldId].translation
          }
        }

        await catalog.write(locale, extractedCatalog as CatalogType)
      }
    })
  )

  return commandSuccess
}

type CliOptions = {
  config?: string
}

if (require.main === module) {
  program
    .option("--config <path>", "Path to the config file")
    .parse(process.argv)

  const options = program.opts<CliOptions>()

  const config = getConfig({
    configPath: options.config,
  })

  const result = command(config).then(() => {
    if (!result) process.exit(1)
  })
}
