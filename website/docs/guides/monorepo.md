---
title: Monorepo Setup
description: How to organize message catalogs, extraction and the shared runtime when Lingui is used across several apps and packages in a monorepo
---

# Monorepo

Lingui has no monorepo-specific mode. Everything on this page is regular configuration; what changes in a monorepo is where you put it. You need to decide three things:

1. Where the catalogs live: one catalog per app, or one per package.
2. Where extraction runs: which `lingui.config` scans which sources.
3. How the runtime is shared: one `I18nProvider` and one copy of `@lingui/react`.

The examples use the layout below. It works the same with pnpm, Yarn or npm workspaces, with or without Turborepo or Nx on top.

```bash
.
├── apps/
│   ├── web/
│   └── admin/
└── packages/
    └── ui/     # shared components that render <Trans>
```

## Choose a Strategy

| Your setup                                                                           | Strategy                                                                   |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Internal (unpublished) packages, one or a few apps                                   | [One catalog per app](#one-catalog-per-app). Start here                    |
| Several apps share many strings that should be translated once                       | [Catalog per package, merged per app](#catalog-per-package-merged-per-app) |
| Shared packages, and each app catalog should contain only what the app actually uses | [Dependency-based extraction](#dependency-based-extraction), experimental  |
| Packages published to npm and used outside the monorepo                              | [Published packages](#published-packages)                                  |

## One Catalog per App

Each app owns a `lingui.config.ts`, its catalogs and the `extract` and `compile` scripts. Shared packages have no Lingui config. The app includes their source directories, so their messages land in the catalog of every app that uses them:

```ts title="apps/web/lingui.config.ts"
import { defineConfig } from "@lingui/conf";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "cs"],
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}",
      include: ["<rootDir>/src", "<rootDir>/../../packages/ui/src"],
    },
  ],
});
```

Run [`lingui extract`](/ref/cli#extract) and [`lingui compile`](/ref/cli#compile) from `apps/web` through the app's `package.json` scripts:

```json title="apps/web/package.json"
{
  "scripts": {
    "extract": "lingui extract",
    "compile": "lingui compile"
  }
}
```

Scripts run with the package as the working directory, so the CLI finds the app's config. From another directory, pass `--config apps/web/lingui.config.ts`. Every catalog contains exactly what its app renders. Any bundler plugin works unchanged.

The trade-off is that a string from `packages/ui` is translated once per app. A translation management system with translation memory removes most of that cost.

:::tip Derive the include list from workspace dependencies
Instead of listing packages by hand, read them from the app's `package.json`. The catalog then follows the dependency graph automatically:

```ts title="apps/web/lingui.config.ts"
import { readFileSync } from "node:fs";
import { defineConfig } from "@lingui/conf";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

const workspacePackages = Object.keys(pkg.dependencies ?? {})
  .filter((name) => name.startsWith("@acme/"))
  .map((name) => `<rootDir>/../../packages/${name.split("/")[1]}/src`);

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "cs"],
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}",
      include: ["<rootDir>/src", ...workspacePackages],
    },
  ],
});
```

:::

## Catalog per Package, Merged per App

Every package with messages gets its own catalog, kept next to its sources and translated once. Each app lists its own catalog and those of the packages it uses, and merges them at compile time with [`catalogsMergePath`](/ref/conf#catalogsmergepath):

```ts title="apps/admin/lingui.config.ts"
import { defineConfig } from "@lingui/conf";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "cs"],
  catalogs: [
    {
      path: "<rootDir>/locales/{locale}",
      include: ["<rootDir>/src"],
    },
    {
      path: "<rootDir>/../../packages/ui/locales/{locale}",
      include: ["<rootDir>/../../packages/ui/src"],
    },
  ],
  catalogsMergePath: "<rootDir>/src/i18n/{locale}",
  compileNamespace: "ts",
});
```

`lingui extract` from `apps/admin` updates `apps/admin/locales/*.po` and `packages/ui/locales/*.po`. `lingui compile` merges the messages of the app and its dependencies into one file per locale in `apps/admin/src/i18n/`. Several apps can list the same package. Each extraction writes the same messages into its catalog.

```bash
apps/admin/
├── lingui.config.ts
├── locales/            # en.po, cs.po: the app's own messages
└── src/i18n/           # en.ts, cs.ts: merged, compiled output
packages/ui/
├── locales/            # en.po, cs.po: translated once, shared by every app
└── src/
```

`catalogsMergePath` applies only to `lingui compile`. The [Vite plugin](/ref/vite-plugin) and [webpack loader](/ref/loader) compile one `.po` file per import and do not merge. With them, call [`i18n.load`](/ref/core#i18n.load) once for the app's catalog and once per package. It merges messages of the same locale:

```ts title="apps/admin/src/activate.ts"
import { i18n } from "@lingui/core";

export async function activate(locale: string) {
  const app = await import(`../locales/${locale}.po`);
  const ui = await import(`../../../packages/ui/locales/${locale}.po`);
  i18n.load(locale, app.messages);
  i18n.load(locale, ui.messages);
  i18n.activate(locale);
}
```

Both tools compile a `.po` file from any directory, as long as the app's config lists its catalog.

## Dependency-Based Extraction

Both strategies above tell Lingui which directories to scan. The [experimental extractor](/guides/message-extraction#dependency-tree-crawling) starts from the app's entry point instead, bundles it and follows every import, including workspace packages. There is no include list to maintain. Unused exports are tree-shaken away, so each catalog contains only the messages its app renders.

:::caution Experimental
This is an experimental feature. Experimental features are not covered by semver and may be subject to change.
:::

```ts title="apps/web/lingui.config.ts"
import { defineConfig } from "@lingui/conf";
import { createEsbuildBundler } from "@lingui/cli/bundlers/esbuild";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "cs"],
  catalogs: [],
  experimental: {
    extractor: {
      entries: ["<rootDir>/src/main.tsx"],
      output: "<rootDir>/src/locales/{locale}",
      bundler: createEsbuildBundler({ includeDeps: ["@acme"] }),
    },
  },
});
```

`includeDeps` lists the package scopes to follow. Other package imports are treated as external and skipped. Run `lingui extract-experimental` from the app. The shared packages need no configuration. Path aliases from `tsconfig.json` and the rolldown bundler are covered in [Configuring the Bundler](/guides/message-extraction#configuring-the-bundler).

## Published Packages

Consumers of an npm package cannot see its sources by default. The package either brings its translations along or leaves translation to the consumer. Three patterns work, from simplest to most flexible:

- Keep translations out of the package. Accept already-translated text as props (`label`, `placeholder`, `aria-label`) and let the consuming app translate it with its own catalog. This suits a few components, not a whole component library.
- One catalog for the whole library, shipped compiled. Extract all library packages into a single catalog and compile it in the library's build. Publish the compiled catalogs inside the library or as a dedicated package such as `@acme/translations`. The host app loads two catalogs with `i18n.load`, its own and the library's, as in the [example above](#catalog-per-package-merged-per-app) but from the library's compiled files. The library catalog also contains messages of components the app never renders, usually a small cost.
- Ship the sources next to the compiled output. Publish `src/` alongside `dist/`. The consuming app adds the package's source directory to `include`, for example `<rootDir>/node_modules/@acme/ui/src`, and translates the library's messages like its own. List each package directory explicitly. A wildcard such as `@acme/*/src` does not descend into the symlinks package managers create under `node_modules`.

In every case, declare `@lingui/react` and `@lingui/core` as `peerDependencies` so the package uses the consumer's copy, and rely on the consumer's `I18nProvider`.

## Sharing the Runtime

The runtime setup is the same for every strategy:

- One `I18nProvider`, owned by the app. Shared packages render `<Trans>` and call `useLingui`, but never create a provider or load catalogs themselves. In components, take `t` from `useLingui()` rather than the global `t` from `@lingui/core/macro`. The global `t` uses the global `i18n` instance, not the one the provider passes down. It can then render untranslated text while the rest of the app is fine.

  ```tsx title="packages/ui/src/SaveButton.tsx"
  import { Trans, useLingui } from "@lingui/react/macro";

  export function SaveButton() {
    const { t } = useLingui(); // bound to the provider's i18n, not the global one
    return (
      <button aria-label={t`Save changes`}>
        <Trans>Save</Trans>
      </button>
    );
  }
  ```

- Import macros directly in every package, from `@lingui/react/macro` and `@lingui/core/macro`. If you re-export them from a shared package instead, add that package to [`macro.corePackage`](/ref/conf#macrocorepackage) and [`macro.jsxPackage`](/ref/conf#macrojsxpackage). Without that, messages behind the re-export are silently skipped during extraction.
- Exactly one copy of `@lingui/react` and `@lingui/core`. Declare them in every package that uses them, with the same version. pnpm's `catalog:` protocol or a root-level override keeps versions aligned. Two copies mean two React contexts, and shared components throw an error about a missing `I18nProvider`.
- Optionally, a shared `i18n` instance. By default every package imports the same `i18n` singleton from `@lingui/core`, so there is nothing to do. If you create your own with `setupI18n`, export it from a workspace package such as `@acme/i18n` and set [`runtimeConfigModule`](/ref/conf#runtimeconfigmodule) to `["@acme/i18n", "i18n"]`. The value becomes an import in every transformed file, so a relative path such as `./i18n` would resolve from only one directory.

## Build Tooling

- **Babel.** `@lingui/babel-plugin-lingui-macro` searches for `lingui.config` upward from the build's working directory, not from the file being compiled. Files from sibling packages therefore get the app's config, which is what you want. Some Nx executors run the build from the repository root. In that case, point the `LINGUI_CONFIG` environment variable at the app's config file, or pass the plugin a `linguiConfig` option created with `getConfig` from `@lingui/conf`.
- **SWC.** [`@lingui/swc-plugin`](/ref/swc-plugin) does not read `lingui.config` at all. If you changed `runtimeConfigModule`, mirror it as `runtimeModules` in each app's SWC configuration.
- **Turborepo.** The app's `extract` task reads sources outside its package. Declare them as inputs with `$TURBO_ROOT$`, or the cached task will not rerun when a shared package changes:

  ```json title="turbo.json"
  {
    "tasks": {
      "extract": {
        "inputs": ["$TURBO_DEFAULT$", "$TURBO_ROOT$/packages/*/src/**"],
        "outputs": ["src/locales/*.po"]
      }
    }
  }
  ```

  Nx users can express the same dependency with target `inputs`.

## Troubleshooting

- **Provider error from shared components.** `Trans component was rendered without I18nProvider` or `useLingui hook was used without I18nProvider` is thrown although the app renders a provider. There are two copies of `@lingui/react`. Run `pnpm why @lingui/react` (or `npm ls`, `yarn why`) and align the versions of `@lingui/*`, React and TypeScript across packages. A mismatch in any of them can make pnpm install a second copy.
- **Shared components stay untranslated.** They render source text or message IDs while the app is translated. They use the global `t` from `@lingui/core/macro`, but the app loads its catalogs into a different `i18n` instance. Use `useLingui()` in components, or load the catalogs into the global instance too.
- **Shared-package messages missing or obsolete.** The app's config does not include the package sources. Add its `src` directory to `include`, or switch to a catalog per package.
- **Paths differ between repo root and app.** Prefix every path with [`<rootDir>`](/ref/conf#rootdir). Paths without it resolve against the current working directory. Also run `extract` from the same directory each time. The source references in `.po` files are relative to it.
- **Nested `node_modules` or `dist` gets extracted.** `include` points at a whole package directory outside the app. Relative `exclude` patterns, including the default `node_modules` one, do not match files outside the working directory. Include the package's `src` directory instead, or prefix the `exclude` patterns with `<rootDir>` too.
