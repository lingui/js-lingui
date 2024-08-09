---
title: Lingui Configuration
description: Learn how to configure Lingui for your project
---

# Lingui Configuration

Configuration is read from 4 different sources (the first found wins):

- from `lingui` section in `package.json`
- from `.linguirc`
- from `lingui.config.js`
- from `lingui.config.ts` _(since 3.4.0)_

You can also define environment variable `LINGUI_CONFIG` with path to your config file.

In the case of TypeScript based config you can use ESM format and _export default_.

Default config:

```json
{
  "catalogs": [
    {
      "path": "<rootDir>/locale/{locale}/messages",
      "include": ["<rootDir>"],
      "exclude": ["**/node_modules/**"]
    }
  ],
  "catalogsMergePath": "",
  "compileNamespace": "cjs",
  "extractorParserOptions": {},
  "compilerBabelOptions": {},
  "fallbackLocales": {},
  "format": "po",
  "locales": [],
  "extractors": ["babel"],
  "orderBy": "messageId",
  "pseudoLocale": "",
  "rootDir": ".",
  "runtimeConfigModule": ["@lingui/core", "i18n"],
  "sourceLocale": ""
}
```

## `catalogs`

Default:

```js
[
  {
    path: "<rootDir>/locale/{locale}/messages",
    include: ["<rootDir>"],
    exclude: ["**/node_modules/**"],
  },
];
```

Defines location of message catalogs and what files are included when [`extract`](/docs/ref/cli.md#extract) is scanning for messages.

`path` shouldn't end with slash and it shouldn't include file extension which depends on [`format`](/docs/ref/catalog-formats.md).
`{locale}` token is replaced by catalog locale.

Patterns in `include` and `exclude` are passed to [minimatch](https://github.com/isaacs/minimatch).

`path`, `include`, and `exclude` are interpreted from the current process CWD. If you want to make these paths relative to the configuration file, you can prefix them with a [`rootDir`](#rootdir) token. By default, [`rootDir`](#rootdir) represents the configuration file's location.

`{name}` token in `path` is replaced with a catalog name. Source path must include `{name}` pattern as well and it works as a `*` glob pattern:

```json
{
  "catalogs": [
    {
      "path": "<rootDir>/components/{name}/locale/{locale}",
      "include": ["<rootDir>/components/{name}/"]
    }
  ]
}
```

#### Examples

Let's assume we use `locales: ["en", "cs"]` and `format: "po"` in all examples.

#### All catalogs in one directory

```json
{
  "catalogs": [
    {
      "path": "locales/{locale}"
    }
  ]
}
```

```bash
locales/
├── en.po
└── cs.po
```

#### Catalogs in separate directories

```js
{
  catalogs: [
    {
      path: "locales/{locale}/messages",
    },
  ];
}
```

```bash
locales
├── en/
│   └── messages.po
└── cs/
    └── messages.po
```

#### Separate catalogs per component, placed inside component dir

```json
{
  "catalogs": [
    {
      "path": "components/{name}/locale/{locale}",
      "include": ["components/{name}/"]
    }
  ]
}
```

```shell
components/
├── RegistrationForm/
│   ├── locale/
│   │  ├── en.po
│   │  └── cs.po
│   ├── RegistrationForm.test.js
│   └── RegistrationForm.js
└── LoginForm/
    ├── locale/
    │  ├── en.po
    │  └── cs.po
    ├── LoginForm.test.js
    └── LoginForm.js
```

#### Separate catalogs per component, placed inside shared directory

```json
{
  "catalogs": [
    {
      "path": "locale/{locale}/{name}",
      "include": ["components/{name}/"]
    }
  ]
}
```

```shell
.
├── locale/
│   ├── en/
│   │   ├── RegistrationForm.po
│   │   └── LoginForm.po
│   └── cs/
│       ├── RegistrationForm.po
│       └── LoginForm.po
└── components/
    ├── RegistrationForm/
    │   ├── RegistrationForm.test.js
    │   └── RegistrationForm.js
    └── LoginForm/
        ├── LoginForm.test.js
        └── LoginForm.js
```

## catalogsMergePath

Default: `""`

Specify the path to merge translated catalogs into a single file per locale during compile.

#### Example

Let's assume we have [separate catalogs for `locales: ["en", "cs"]` per component placed inside shared directory](#separate-catalogs-per-component-placed-inside-shared-directory).

Using `catalogsMergePath`, separate catalogs can be merged during [`compile`](/docs/ref/cli.md#compile):

```diff
{
  "catalogs": [
    {
      "path": "/locale/{locale}/{name}",
      "include": ["components/{name}/"]
    }
  ],
+ "catalogsMergePath": "locales/{locale}"
}
```

```diff
.
  ├── locale/
  │   ├── en/
  │   │   ├── RegistrationForm.po
- │   │   ├── RegistrationForm.js
  │   │   ├── LoginForm.po
- │   │   └── LoginForm.js
  │   └── cs/
  │       ├── RegistrationForm.po
- │       ├── RegistrationForm.js
  │       ├── LoginForm.po
- │       └── LoginForm.js
+ ├── locales/
+ │   ├── en.js
+ │   └── cs.js
  └── components/
      ├── RegistrationForm/
      │   ├── RegistrationForm.test.js
      │   └── RegistrationForm.js
      └── LoginForm/
          ├── LoginForm.test.js
          └── LoginForm.js
```

## compileNamespace

Default: `cjs`

Specify namespace for exporting compiled messages. See [`compile`](/docs/ref/cli.md#compile) command.

#### cjs

Use CommonJS exports:

```js
/* eslint-disable */module.exports={messages: {"..."}}
```

#### es

Use ES6 named export:

```js
/* eslint-disable */export const messages = {"..."}
```

#### ts

Use ES6 named export + .ts file with an additional `{compiledFile}.d.ts` file:

```js
/* eslint-disable */export const messages = {"..."}
```

```js
import { Messages } from '@lingui/core';
declare const messages: Messages;
export { messages };
```

#### json

```json
{"messages": {"..."}}
```

#### (window\|global).(.\*)

Assign compiled messages to `window` or `global` object. Specify an identifier after `window` or `global` to which the catalog is assigned, e.g. `window.i18n`.

For example, setting [`compileNamespace`](#compilenamespace) to `window.i18n` creates file similar to this:

```js
/* eslint-disable */window.i18n={messages: {"..."}}
```

## extractorParserOptions

Default: `{}`

Specify extra options used to parse source files when messages are being extracted.

```ts
"extractorParserOptions": {
  /**
   * default false
   * By default, standard decorators (Stage3) are applied for TS files
   * Enable this if you want to use TypesScript's experimental decorators.
   */
  tsExperimentalDecorators?: boolean
  /**
   * default false
   * Enable if you use flow. This will apply Flow syntax to files with .js, cjs, .mjs extension.
   */
  flow?: boolean
}
```

## compilerBabelOptions

Default:

```json
{
  "minified": true,
  "jsescOption": {
    "minimal": true
  }
}
```

Specify extra babel options used to generate files when messages are being compiled. We use internally `@babel/generator` that accepts some configuration for generating code with/out ASCII characters. These are all the options available: [jsesc](https://github.com/mathiasbynens/jsesc).

```json
{
  "compilerBabelOptions": {
    "jsescOption": {
      "minimal": false
    }
  }
}
```

This example configuration will compile with escaped ASCII characters ([jsesc#minimal](https://github.com/mathiasbynens/jsesc#minimal)).

## fallbackLocales

Default: `{}`

`fallbackLocales` by default is using [CLDR Parent Locales](https://github.com/unicode-cldr/cldr-core/blob/master/supplemental/parentLocales.json), unless you disable it with a `false`:

```json
{
  "fallbackLocales": false
}
```

`fallbackLocales` object lets us configure fallback locales to each locale instance.

```json
{
  "fallbackLocales": {
    "en-US": ["en-GB", "en"],
    "es-MX": "es"
  }
}
```

On this example if any translation isn't found on `en-US` then will search on `en-GB`, after that if not found we'll search in `en`.

Also, we can configure a default one for everything:

```json
{
  "fallbackLocales": {
    "en-US": ["en-GB", "en"],
    "es-MX": "es",
    "default": "en"
  }
}
```

Translations from `fallbackLocales` is used when translation for given locale is missing.

If `fallbackLocales` is `false` default message or message ID is used instead.

## format

Default: `po`

Message catalog format. The `po` formatter is used by default. Other formatters are available as separate packages.

```js title="lingui.config.{js,ts}"
import { formatter } from "@lingui/format-po"

export default {
  [...]
  format: formatter({ lineNumbers: false })
}
```

Official Lingui format packages:

- [@lingui/format-po](https://www.npmjs.com/package/@lingui/format-po) - Gettext PO used by default in Lingui
- [@lingui/format-po-gettext](https://www.npmjs.com/package/@lingui/format-po-gettext) - Gettext PO format with gettext-style plurals
- [@lingui/format-json](https://www.npmjs.com/package/@lingui/format-json) - JSON format (`minimal` and `lingui`)
- [@lingui/format-csv](https://www.npmjs.com/package/@lingui/format-csv) - CSV format

See the README of each package for configuration parameters.

Visit [Advanced: Custom Formatter](/docs/guides/custom-formatter.md) to learn how to create a custom formatter.

## locales

Default: `[]`

Locale tags which are used in the project. [`extract`](/docs/ref/cli.md#extract) and [`compile`](/docs/ref/cli.md#compile) writes one catalog for each locale. Each locale should be a valid [BCP-47 code](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html).

## orderBy

Default: `message`

Order of messages in catalog:

#### message

Sort by source message.

#### messageId

Sort by the message ID, `js-lingui-id` will be used if no custom id provided.

#### origin

Sort by message origin (e.g. `App.js:3`)

## pseudoLocale

Default: `""`

Locale used for pseudolocalization. For example when you set `pseudoLocale: "en"` then all messages in `en` catalog will be pseudo localized. The locale has to be included in `locales` config.

## rootDir

Default: The root of the directory containing your Lingui config file or the `package.json`.

The root directory that Lingui CLI should scan when extracting messages from source files.

Note that using `<rootDir>` as a string token in any other path-based config settings will refer back to this value.

## runtimeConfigModule

Default: `["@lingui/core", "i18n"]`

Module path with exported i18n object. The first value in array is module path, the second is the import identifier. This value is used in macros, which need to reference the global `i18n` object.

You only need to set this value if you use custom object created using [`setupI18n`](/docs/ref/core.md#setupi18n):

```jsx
// If you import `i18n` object from custom module like this:
import { i18n } from "./custom-i18n-config";

// ... then add following line to Lingui configuration:
// "runtimeConfigModule": ["./custom-i18n-config", "i18n"]
```

You may use a different named export:

```jsx
import { myI18n } from "./custom-i18n-config";
// "runtimeConfigModule": ["./custom-i18n-config", "myI18n"]
```

In some advanced cases you may also need to change the module from which [Trans](/docs/ref/macro.mdx#trans) or [useLingui](/docs/ref/macro.mdx#uselingui) is imported. To do that, pass an object to `runtimeConfigModule`:

```jsx
// If you import `i18n` object from custom module like this:
import { Trans, i18n } from "./custom-config";

// ... then add following line to Lingui configuration:
// "runtimeConfigModule": {
//   i18n: ["./custom-config", "i18n"],
//   Trans: ["./custom-config", "Trans"]
//   useLingui: ["./custom-useLingui", "myUseLingui"]
// }
```

## sourceLocale

Default: `''`

Locale of message IDs, which is used in source files. Catalog for `sourceLocale` doesn't require translated messages, because message IDs are used by default. However, it's still possible to override message ID by providing custom translation.

The difference between [`fallbackLocales`](#fallbacklocales) and `sourceLocale` is that [`fallbackLocales`](#fallbacklocales) is used in translation, while `sourceLocale` is used for the message ID.

## extractors

Default: `[babel]`

Extractors it's the way to customize which extractor you want for your codebase.

```js
{
   "extractors": [
      myCustomExtractor,
   ]
}
```

Visit [Advanced: Custom Extractor](/docs/guides/custom-extractor.md) to learn how to create a custom extractor.
