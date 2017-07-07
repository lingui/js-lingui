# Reference: CLI

## Configuration

CLI can be configured using `lingui` section in `package.json`.

Default config:

```json
{
  "lingui": {
    "localeDir": "<rootDir>/locale",
    "fallbackLanguage": "",
    "srcPathDirs": ["<rootDir>"],
    "srcPathIgnorePatterns": ["/node_modules/"],
    "rootDir": "."
  }
}
```

By default, messages are extracted from all `js` files in root directory (`srcPathDirs` config) while ignoring all `/node_modules/` (`srcPathIgnorePatterns`).

Messages catalogs and written inside `localeDir`.

`fallbackLanguage` is used for missing translations. If `fallbackLanguage` isn't defined or translation in `fallbackLanguage` is missing too, message ID is used instead.
