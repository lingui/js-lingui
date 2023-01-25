# Locale Detection

`@lingui/detect-locale` is little package *just (1 kB Gzip)* with some helper functions that will help you detect the locale of the user:

## Installation

Install `@lingui/detect-locale` as a dependency:

```bash npm2yarn
npm install --save @lingui/detect-locale
```

## Usage

`@lingui/detect-locale:` exports multiple methods:

- `detect` - Will return the first occurrence of detectors
- `multipleDetect` - Will return an array with all the locales detected by each detector

and some helpers:

- `fromCookie(key: string)` - Accepts a key as param will recover from navigator cookies the value
- `fromHtmlTag(tag: string)` - Will find on HtmlDocument the attribute passed in params (normally it's used lang or xml:lang)
- `fromNavigator()` - Recovers the navigator language, it's also compatible with old browsers like IE11
- `fromPath(localePathIndex: number)` - Splits the location.pathname in an array so you have to specify the index of the array where's locale is set
- `fromStorage(key: string, { useSessionStorage: boolean }` - Will search on localStorage by default the item that has that key, if **useSessionStorage** is passed, will search on sessionStorage
- `fromSubdomain(localeSubdomainIndex: number)` - Like fromPath, splits the location.href on segments you must specify the index of that segment
- `fromUrl(parameter: string)` - Uses a query-string parser to recover the correct parameter

Practically all detectors accepts a custom document, location, or window object as param, it's useful when testing or using some server-side strategy.

### Usage with `detect`

``` jsx
import { detect, fromUrl, fromStorage, fromNavigator } from "@lingui/detect-locale"

// can be a function with custom logic or just a string, `detect` method will handle it
const DEFAULT_FALLBACK = () => "en"

const result = detect(
  fromUrl("lang"),
  fromStorage("lang"),
  fromNavigator(),
  DEFAULT_FALLBACK
)

console.log(result) // "en"
```

### Usage with `multipleDetect`

``` jsx
import { multipleDetect, fromUrl, fromStorage, fromNavigator } from "@lingui/detect-locale"

// can be a function with custom logic or just a string, `detect` method will handle it
const DEFAULT_FALLBACK = () => "en"

const result = multipleDetect(
  fromUrl("lang"),
  fromStorage("lang"),
  fromNavigator(),
  DEFAULT_FALLBACK
)

console.log(result) // ["en", "es"]
```
