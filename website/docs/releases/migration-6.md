# Migration guide from 5.x to 6.x

This guide will help you migrate from Lingui 5.x to 6.x. It covers the most important changes and breaking changes.

Need to upgrade an older project to v5 first? See our [older migration guide](/releases/migration-5).

<!-- TODO: create dedicated deployment for 5.x documentation -->
If you're looking for 5.x documentation, you can find it [here](https://lingui.dev).

## Node.js Version

The minimum supported version of Node.js in Lingui v6 is v22.19+.

## ESM-Only Distribution

Lingui 6.0 is now distributed as **ESM-only** (ECMAScript Modules). ESM is the official, standardized module system for JavaScript, and the entire ecosystem is converging toward this standard.

### Why This Change

Previously, Lingui shipped dual builds (both ESM and CommonJS), which created significant drawbacks:

- Nearly doubled package sizes
- Maintenance complexity with conditionals and workarounds
- Subtle bugs from module duplication and dependency resolution issues

By moving to ESM-only, Lingui becomes **smaller, simpler, and more future-proof**. Thanks to Node.js improvements like [`require(esm)`](https://joyeecheung.github.io/blog/2024/03/18/require-esm-in-node-js/), this transition is now seamless for most users.

### What Changed

Most Lingui packages have been converted to ESM-only distribution. The following packages remain as CommonJS for compatibility reasons:

- `@lingui/metro-transformer`

Note that these excluded packages still use ESM dependencies internally, which may affect their consumers in certain edge cases.

### Migration

For most users, **no changes are required**. Modern bundlers (Vite, Webpack, esbuild, Rollup) and Node.js versions that support `require()` for ESM modules (20.16+, 22.19+, or 24+) handle ESM imports transparently.

## Deprecated `format` String and `formatOptions` Removed

The deprecated `format` (as a string) and `formatOptions` configuration options have been **removed**.

### What Changed

The old configuration style using a format string and separate options object is no longer supported:

```js title="lingui.config.js"
// No longer supported
export default {
  locales: ["en", "cs"],
  format: "po",
  formatOptions: { lineNumbers: true },
};
```

### Migration

Update your configuration to use the formatter function instead:

```js title="lingui.config.js"
import { defineConfig } from "@lingui/cli";
import { formatter } from "@lingui/format-po";

export default defineConfig({
  locales: ["en", "cs"],
  format: formatter({ lineNumbers: true }),
});
```

If you only have `format: "po"` with no `formatOptions` in your configuration, you can simply remove this line entirely. Lingui defaults to the `po` formatter when no format is specified.

If you use a different formatter or have `formatOptions`, you need to import the formatter from its package and pass any options to the function:

- **PO format**: `import { formatter } from "@lingui/format-po"`
- **PO Gettext format**: `import { formatter } from "@lingui/format-po-gettext"`
- **JSON format**: `import { formatter } from "@lingui/format-json"`
- **CSV format**: `import { formatter } from "@lingui/format-csv"`

See [Catalog Formats](/ref/catalog-formats) for more details on available formatters and their options.

## Deprecated `@lingui/macro` Package No Longer Maintained

The `@lingui/macro` package is **no longer maintained** and will not receive any updates. This package was deprecated in Lingui 5.0 when macros were split into separate entry points from existing packages.

### What Changed

In Lingui 5.0, the macros were split to allow using Lingui in non-React projects without pulling in React dependencies:

- **React (JSX) macros** moved to `@lingui/react/macro`
- **Core (JS) macros** moved to `@lingui/core/macro`

The `@lingui/macro` package continued to work in v5 but emitted deprecation warnings. In v6, it is no longer maintained and will not be compatible with future releases.

### Migration

If you were still using `@lingui/macro`, see the [v5 migration guide](/releases/migration-5#react-and-js-macros-were-split-to-separate-packages) for detailed migration instructions and available codemods.

## YAML Configuration Support Removed

Support for YAML configuration files has been **removed**. The underlying configuration library has been changed from `cosmiconfig` to `lilconfig`, a zero-dependency alternative with the same API.

### What Changed

YAML configuration files (`.linguirc.yaml`, `.linguirc.yml`) are no longer supported. Lingui now only supports:

- `lingui.config.js` or `lingui.config.ts` (recommended)
- `.linguirc` in JSON format
- `lingui` section in `package.json`

### Migration

Convert your YAML configuration to JavaScript/TypeScript or JSON format.

**Before** (`.linguirc.yaml`):

```yaml
locales:
  - en
  - cs
sourceLocale: en
catalogs:
  - path: src/locales/{locale}/messages
    include:
      - src
```

**After** (`lingui.config.ts`):

```ts
import { defineConfig } from "@lingui/cli";

export default defineConfig({
  locales: ["en", "cs"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
});
```

Using TypeScript configuration with `defineConfig` is recommended as it provides type safety and better IDE support.

## Create React App (CRA) Example Removed

The Create React App example has been **removed** from the repository.

CRA is [officially deprecated](https://react.dev/blog/2025/02/14/sunsetting-create-react-app) and no longer fits the modern JavaScript ecosystem. It lacks support for modern ESM patterns and would slow down Lingui's evolution toward current best practices.

For new projects or migrations, we recommend using Vite with Babel or SWC, which are closer to today's standards. See our [examples](/examples) for working setups.

## Babel Macro Plugin Deprecated

The `babel-plugin-macros` integration is **deprecated** and will be removed in a future release.

The `babel-plugin-macros` package is no longer actively maintained, and its primary adoption driver was CRA. With CRA deprecated, there's little reason to continue supporting this integration path.

Switch to the dedicated Babel or SWC plugins:

- **Babel**: Use `@lingui/babel-plugin-lingui-macro` directly in your Babel config
- **SWC**: Use `@lingui/swc-plugin`

See [Installation](/installation) for configuration details.

## TypeScript Type Changes

Several Lingui packages now use TypeScript's `strictNullChecks`, which improves type safety but may require updates if you use Lingui's internal types in custom integrations.

### What Changed

#### `null` vs `undefined`

The codebase now consistently uses `undefined` instead of `null` for optional values. This follows the TypeScript team's convention and simplifies type handling since `undefined` naturally occurs with optional properties and parameters.

If your code explicitly checks for `null` from Lingui APIs, update it to check for `undefined` instead.

#### `ExtractedMessageType` vs `MessageType`

The distinction between extracted messages and loaded catalog messages has been strengthened:

- **`ExtractedMessageType`** / **`ExtractedCatalogType`**: Used for messages produced by the extractor. These always include `placeholders` and `comments` fields (even if empty).
- **`MessageType`** / **`CatalogType`**: Used for messages loaded from catalogs on disk. These may include additional fields like `translation`, `obsolete`, and `extra`, but may omit `placeholders` and `comments`.

### Migration

This change only affects users who have built custom integrations using Lingui's internal types (custom extractors, formatters, or tooling).

If you encounter TypeScript errors after upgrading:

1. Update any `null` checks to use `undefined`
2. Use the appropriate message type (`ExtractedMessageType` vs `MessageType`) based on your use case
3. Update type annotations if properties that were previously `| null` are now `| undefined`
