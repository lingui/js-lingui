---
title: Message Catalog Formats
description: Learn about the different catalog formats supported by Lingui
---

# Catalog Formats

Catalog format (configured by the [`format`](/ref/conf#format) option) refers to the offline catalog file format. This format is never used in production, because the catalog is compiled into a JS module.

The reason for this build step is that the choice of catalog format depends on the individual internationalization workflow. On the other hand, the runtime catalog should be as simple as possible so that it can be parsed quickly without additional overhead.

## PO

PO files are translation files used by [gettext](https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html) internationalization system. This is the **recommended** and the **default** catalog format in Lingui.

[![Version][badge-version-po]][package-po]
[![Downloads][badge-downloads-po]][package-po]

The advantages of this format are:

- readable even for large messages
- supports comments for translators
- supports metadata (origin, flags)
- supports contexts
- standard format supported by many localization tools

### Installation {#po-installation}

```bash npm2yarn
npm install --save-dev @lingui/format-po
```

### Usage {#po-usage}

```js title="lingui.config.{js,ts}"
import { defineConfig } from "@lingui/cli";
import { formatter } from "@lingui/format-po";

export default defineConfig({
  // [...]
  format: formatter({ lineNumbers: false }),
});
```

### Configuration {#po-configuration}

PO formatter accepts the following options:

| Option                        | Type                            | Default | Description                                                                                                                                                                            |
| ----------------------------- | ------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `origins`                     | boolean                         | `true`  | Include comments in the PO file that indicate where each message is used in the source code. This provides additional context during the translation                                   |
| `lineNumbers`                 | boolean                         | `true`  | Include line numbers in the origin comments. This makes it easier to locate messages in the source code                                                                                |
| `printLinguiId`               | boolean                         | `false` | Add a `js-lingui-id: hash` comment to each message in the PO file. This ID is a hash generated by Lingui                                                                               |
| `explicitIdAsDefault`         | boolean                         | `false` | Use the `msgid` as is for messages with explicit IDs. The formatter will add the `js-lingui-explicit-id` flag for such strings                                                         |
| `customHeaderAttributes`      | `{[key: string]: string}`       | `{}`    | Allows adding custom key-value pairs to the PO file header                                                                                                                             |
| `printPlaceholdersInComments` | boolean \| `{ limit?: number }` | `true`  | Print values for unnamed placeholders as comments for each message. This can give translators more context for better translations. By default, the first 3 placeholders are displayed |

### Examples {#po-examples}

```po
#: src/App.js:3
#. Comment for translators
msgid "messageId"
msgstr "Translated Message"

#: src/App.js:3
#, obsolete
msgid "obsoleteId"
msgstr "Obsolete Message"
```

Messages with context are exported in the following way:

```po
#: src/Inbox.js:12
msgctxt "my context"
msgid "msg.inbox"
msgstr "Message Inbox"
```

Messages with plurals are exported in [ICU MessageFormat](/guides/message-format):

```po
msgid "{count, plural, one {Message} other {Messages}}"
msgstr "{count, plural, one {Message} other {Messages}}"
```

Messages with placeholders:

```js
t`Hello ${user.name} ${value}`;
```

are exported as:

```po
#. placeholder {0}: user.name
msgid "Hello {0} {value}"
msgstr "Hello {0} {value}"
```

## PO with gettext Plurals {#po-gettext}

When using localization backends that don't understand the ICU plural syntax exported by the default `po` formatter, **po-gettext** can be used to read and write to PO files using gettext-native plurals.

[![Version][badge-version-po-gettext]][package-po-gettext]
[![Downloads][badge-downloads-po-gettext]][package-po-gettext]

### Installation {#po-gettext-installation}

```bash npm2yarn
npm install --save-dev @lingui/format-po-gettext
```

### Usage {#po-gettext-usage}

```js title="lingui.config.{js,ts}"
import { defineConfig } from "@lingui/cli";
import { formatter } from "@lingui/format-po-gettext";

export default defineConfig({
  // [...]
  format: formatter({ lineNumbers: false }),
});
```

### Configuration {#po-gettext-configuration}

The PO Gettext formatter accepts the following options:

| Option                 | Type    | Default        | Description                                                                                                                                                              |
| ---------------------- | ------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `origins`              | boolean | `true`         | Include comments in the PO file that indicate where each message is used in the source code. This provides additional context during the translation                     |
| `lineNumbers`          | boolean | `true`         | Include line numbers in the origin comments. This makes it easier to locate messages in the source code                                                                  |
| `disableSelectWarning` | boolean | `false`        | Disable warnings about unsupported `Select` features encountered in catalogs. This can be useful if you're aware of the limitation and want to suppress related warnings |
| `customICUPrefix`      | string  | `"js-lingui:"` | Override the default prefix for ICU and plural comments in the final PO catalog                                                                                          |

### Examples {#po-gettext-examples}

With this format, plural messages are exported in the following ways, depending on whether an explicit ID is set:

- Message **with custom ID "my_message"** that is pluralized on property "_someCount_".

  ```po
  #. js-lingui:pluralize_on=someCount
  msgid "my_message"
  msgid_plural "my_message_plural"
  msgstr[0] "Singular case"
  msgstr[1] "Case number {someCount}"
  ```

  Note that `msgid_plural` was created by appending a `_plural` suffix.

- Message **without custom ID** that is pluralized on property "_anotherCount_".

  To allow matching this PO item to the appropriate catalog entry when deserializing, the original ICU message is also stored in the generated comment.

  ```po
  #. js-lingui:icu=%7BanotherCount%2C+plural%2C+one+%7BSingular+case%7D+other+%7BCase+number+%7BanotherCount%7D%7D%7D&pluralize_on=anotherCount
  msgid "Singular case"
  msgid_plural "Case number {anotherCount}"
  msgstr[0] "Singular case"
  msgstr[1] "Case number {anotherCount}"
  ```

  Note how `msgid` and `msgid_plural` were extracted from the original message.

- Message **with a custom comment prefix**.

  Some TMS might modify the ICU comment by attempting to split lines to be 80 characters or less, or have trouble reading lingui comments because of the `js-lingui:` prefix. To change the prefix, set `customICUPrefix` to modify the prefix for ICU comments.

  ```po
  # with default prefix
  #. js-
  #. lingui:icu=%7BanotherCount%2C+plural%2C+one+%7BSingular+case%7D+other+%7BCase+number+%7BanotherCount%7D%7D%7D&pluralize_on=anotherCount

  # customICUPrefix = jsi18n:
  #. jsi18n:icu=%7BanotherCount%2C+plural%2C+one+%7BSingular+case%7D+other+%7BCase+number+%7BanotherCount%7D%7D%7D&pluralize_on=anotherCount
  ```

### Limitations {#po-gettext-limitations}

This format comes with several caveats and should only be used when using ICU plurals in PO files is not an option:

- Nested/multiple plurals in a message as shown in [`plural`](/ref/macro#plural) are not supported because they cannot be expressed with gettext plurals. Messages containing nested/multiple formats will not be output correctly.
- The [`select`](/ref/macro#select) and [`selectOrdinal`](/ref/macro#selectordinal) cannot be expressed with gettext plurals, but the original ICU format is still stored in the `msgid`/`msgstr` properties. To disable the warning that this may not be the expected behavior, add `{ disableSelectWarning: true }` to the [`format`](/ref/conf#format) options.
- Source/development languages with more than two plurals could experience difficulties when no custom IDs are used, as gettext cannot have more than two plurals cases identifying an item (`msgid` and `msgid_plural`).
- Gettext doesn't support plurals for negative and fractional numbers even though some languages have special rules for these cases.

## JSON

This format is used to store messages in a JSON file. There are two types of JSON format: [minimal](#minimal-style) and [lingui](#lingui-style).

[![Version][badge-version-json]][package-json]
[![Downloads][badge-downloads-json]][package-json]

### Installation {#json-installation}

```bash npm2yarn
npm install --save-dev @lingui/format-json
```

### Usage {#json-usage}

```js title="lingui.config.{js,ts}"
import { defineConfig } from "@lingui/cli";
import { formatter } from "@lingui/format-json";

export default defineConfig({
  // [...]
  format: formatter({ style: "lingui" }),
});
```

### Configuration {#json-configuration}

JSON formatter accepts the following options:

| Option        | Type                      | Default    | Description                                                                                                                                       |
| ------------- | ------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `style`       | `"lingui"` \| `"minimal"` | `"lingui"` | Specify the output style of the JSON file. `lingui` includes full Lingui-specific metadata, while `minimal` may output a more compact format      |
| `origins`     | boolean                   | `true`     | Include information in the JSON file about where each message is used in the source code. This provides additional context during the translation |
| `lineNumbers` | boolean                   | `true`     | Include line numbers in the origin comments. This makes it easier to locate messages in the source code                                           |
| `indentation` | number                    | `2`        | Set the number of spaces to use for indentation in the output JSON file. This affects the readability of the file when opened in a text editor    |

### Examples {#json-examples}

#### Minimal style

A simple JSON file where each key is a message ID and the value is the translation. The JSON is flat, and there's no reason to use nested keys. The usual motivation behind nested JSON is to save file space, but this file format is only used offline.

The downside of this format is that all metadata about the message is lost. This includes the default message, the origin of the message, and any message flags (obsolete, fuzzy, etc.).

```json
{
  "messageId": "translation"
}
```

#### Lingui style

This file format simply outputs all internal data in JSON format. It's the original file format used by Lingui before support for other catalog formats was added. It might be useful for tools build on top of Lingui CLI which needs to further process catalog data.

```json
{
  "messageId": {
    "translation": "Translated message",
    "message": "Default message",
    "description": "Comment for translators",
    "origin": [["src/App.js", 3]]
  },
  "obsoleteId": {
    "translation": "Obsolete message",
    "origin": [["src/App.js", 3]],
    "obsolete": true
  }
}
```

## CSV

The CSV format is a simple format that can be used to import and export messages from spreadsheets or other tools that support CSV files. It has two columns: message ID and message (source or translation).

[![Version][badge-version-csv]][package-csv]
[![Downloads][badge-downloads-csv]][package-csv]

### Installation {#csv-installation}

```bash npm2yarn
npm install --save-dev @lingui/format-csv
```

### Usage {#csv-usage}

```js title="lingui.config.{js,ts}"
import { defineConfig } from "@lingui/cli";
import { formatter } from "@lingui/format-csv";

export default defineConfig({
  // [...]
  format: formatter(),
});
```

This formatter has no configurable options.

### Examples {#csv-examples}

```csv
messageId,Message
msg.common,String for translation
```

## See Also

- [Custom Formatter](/guides/custom-formatter)

[package-po]: https://www.npmjs.com/package/@lingui/format-po
[package-po-gettext]: https://www.npmjs.com/package/@lingui/format-po-gettext
[package-json]: https://www.npmjs.com/package/@lingui/format-json
[package-csv]: https://www.npmjs.com/package/@lingui/format-csv
[badge-downloads-po]: https://img.shields.io/npm/dw/@lingui/format-po.svg?cacheSeconds=86400
[badge-downloads-po-gettext]: https://img.shields.io/npm/dw/@lingui/format-po-gettext.svg?cacheSeconds=86400
[badge-downloads-json]: https://img.shields.io/npm/dw/@lingui/format-json.svg?cacheSeconds=86400
[badge-downloads-csv]: https://img.shields.io/npm/dw/@lingui/format-csv.svg?cacheSeconds=86400
[badge-version-po]: https://img.shields.io/npm/v/@lingui/format-po.svg?cacheSeconds=86400
[badge-version-po-gettext]: https://img.shields.io/npm/v/@lingui/format-po-gettext.svg?cacheSeconds=86400
[badge-version-json]: https://img.shields.io/npm/v/@lingui/format-json.svg?cacheSeconds=86400
[badge-version-csv]: https://img.shields.io/npm/v/@lingui/format-csv.svg?cacheSeconds=86400
