---
title: Locale Detection
description: Detect the user's locale with the `@lingui/detect-locale` package
---

# Locale Detection

The `@lingui/detect-locale` is a lightweight package _(only ~1 kB Gzip)_ providing several methods and helpers to determine the user's locale using different detection strategies.

Most of the detectors accept custom document, location or window objects as parameters, which is especially useful for testing purposes or when implementing server-side detection strategies.

## Installation

```bash npm2yarn
npm install --save @lingui/detect-locale
```

## Reference

### `detect`

The `detect` method accepts multiple detectors as arguments and returns the first valid locale detected.

### `multipleDetect`

The `multipleDetect` method also accepts multiple detectors as arguments and returns an array with all locales detected by each detector.

### `fromCookie(key: string)` {#fromCookie}

Accepts a key as a parameter and retrieves the locale value from the browser's cookies based on that key.

### `fromHtmlTag(tag: string)` {#fromHtmlTag}

Looks for the specified attribute in the HTML document (commonly `lang` or `xml:lang`) to detect the locale.

### `fromNavigator()` {#fromNavigator}

Retrieves the user's language setting from the browser, compatible with older browsers such as IE11.

### `fromPath(localePathIndex: number)` {#fromPath}

Splits `location.pathname` into an array, requiring you to specify the index where the locale is located.

### `fromStorage(key: string, { useSessionStorage: boolean })` {#fromStorage}

Searches for the item with the specified key in `localStorage` by default. If the `useSessionStorage` parameter is passed, it will search in `sessionStorage`.

### `fromSubdomain(localeSubdomainIndex: number)` {#fromSubdomain}

Splits `location.href` by subdomain segments, requiring the index where the locale is specified.

### `fromUrl(parameter: string)` {#fromUrl}

Uses a query string parser to find the locale by the specified parameter in the URL.

## Usage Examples

### Usage with `detect`

```jsx
import { detect, fromUrl, fromStorage, fromNavigator } from "@lingui/detect-locale";

// can be a function with custom logic or just a string, `detect` method will handle it
const DEFAULT_FALLBACK = () => "en";

const result = detect(fromUrl("lang"), fromStorage("lang"), fromNavigator(), DEFAULT_FALLBACK);

console.log(result); // "en"
```

### Usage with `multipleDetect`

```jsx
import { multipleDetect, fromUrl, fromStorage, fromNavigator } from "@lingui/detect-locale";

// can be a function with custom logic or just a string, `detect` method will handle it
const DEFAULT_FALLBACK = () => "en";

const result = multipleDetect(fromUrl("lang"), fromStorage("lang"), fromNavigator(), DEFAULT_FALLBACK);

console.log(result); // ["en", "es"]
```
