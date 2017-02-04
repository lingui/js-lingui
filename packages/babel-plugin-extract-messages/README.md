# babel-plugin-extract/messages

> This plugin collects message ids from `Trans` components

## Detail

`babel-plugin-transform-react-trans` converts children of `Trans` component to ICU message format which serves as a message ID. The message IDs are used in message catalogue and translations are assigned to it.

For example following message:

```js
<Trans>
  <Plural 
    value={count}
    one="There's one item matching filter"
    other="There're # items matching filter"
  />
  (see <a href="?all">all</a>).
</Trans>
```

is converted to ICU message format:

```js
<Trans 
  id="{count, plural, one {There's one item matching filter} other {There're # items matching filter}} (see <0>all</0>)" 
  params={{ count: count }}
  components={[
    <a href="?all" />
  ]}
/>
```

And following message ID is extracted:

```json
{
  "{count, plural, one {There's one item matching filter} other {There're # items matching filter}} (see <0>all</0>)": {
    "origin": [
      ["App.js", 3] 
    ] 
  }
}
```

Finall, all files under `{localeDir}/_build` needs to be merged into final message catalog. This message catalog can be translated into target languages and loaded back to app.

### Metadata

Each item in generated file is in format `[messageId: string]: metadata`, where metadata contains following information:

- `origin` - Array of filenames and line numbers from where the message is extracted
- `defaults` - Default message if custom messageId is used (`<Trans id="msg">Custom message ID</Trans>` becomes `<Trans id="msg" defaults="Custom message ID" />`)

## Installation

```sh
npm install --save-dev babel-plugin-extract-messages
# or
yarn add --dev babel-plugin-extract-messages
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["extract-messages"]
}
```

### Via CLI

```sh
babel --plugins extract-messages script.js
```

### Via Node API

```js
require("babel-core").transform("code", {
  plugins: ["extract-messages"]
});
```

### Options

### `localeDir`

`string`, defaults to `locale`.

Directory with locales. Files are written to `_build` subdirectory, one json
file per each processed file.

```json
{
  "plugins": [
    ["extract-messages", {
      "localeDir": "./locale"
    }]
  ]
}
```
