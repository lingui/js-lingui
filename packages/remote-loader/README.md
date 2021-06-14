[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/remote-loader

Load your `.json` catalogs remotely.

> This tool is useful when you have plain .json files which are messages/catalogs, but Lingui needs them compiled, this tool under the hood will compile them to Lingui standards.

# Usage

```ts
import { i18n } from "@lingui/core"
import { remoteLoader } from "@lingui/remote-loader"

export async function remoteActive(locale: string) {
  const remoteMessages = await fetch(`https://some-api/${locale}/messages`)
  const compiledMessages = remoteLoader({ messages: remoteMessages })
  i18n.load(locale, compiledMessages)
  i18n.activate(locale)
}
```

### With fallback messages
```ts
import { i18n } from "@lingui/core"
import { remoteLoader } from "@lingui/remote-loader"
import { messages: fallbackMessages } from "./local-messages-to-fallbac/"

export async function remoteActive(locale: string) {
  const remoteMessages = await fetch(`https://some-api/${locale}/messages`)
  const compiledMessages = remoteLoader({ messages: remoteMessages, fallbackMessages })
  i18n.load(locale, compiledMessages)
  i18n.activate(locale)
}
```