# Next.js App Router + SWC plugin

Example of [Lingui](https://lingui.dev) in a [Next.js](https://nextjs.org/) 16 app that uses the App Router and React Server Components. Macros are compiled by the [`@lingui/swc-plugin`](https://lingui.dev/ref/swc-plugin), so there is no Babel in the project.

Looking for the Pages Router? See the [`nextjs-babel`](../nextjs-babel) example.

## Getting Started

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). The proxy picks a locale from the `Accept-Language` header and redirects you to it. Open [http://localhost:3000/es](http://localhost:3000/es) or [http://localhost:3000/pseudo](http://localhost:3000/pseudo) to see the page in another locale.

## How It Works

Each locale lives under its own URL prefix: `/en`, `/es`, `/sr` and `/pseudo`.

- `src/proxy.ts` redirects requests without a prefix to the browser's preferred locale.
- `src/appRouterI18n.ts` keeps one `I18n` instance per locale on the server.
- `src/initLingui.tsx` reads the locale from the `[lang]` segment with `next/root-params` and activates the matching instance. Call it in every page, layout and `generateMetadata`.
- `src/app/[lang]/layout.tsx` provides the instance to Client Components through `LinguiClientProvider`.

The [React Server Components tutorial](https://lingui.dev/tutorials/react-rsc) walks through this setup step by step.

## Lingui Commands

Extract messages from the source code into `src/locales/*.po`:

```bash
yarn lingui:extract
```

`yarn build` runs the extraction before `next build`, so the catalogs are always up to date.

## SWC Plugin Compatibility

SWC plugins are compiled against a specific version of SWC, and backwards compatibility between `next-swc` versions is not guaranteed. Pin `@lingui/swc-plugin` to an exact version that matches your Next.js version, without a range specifier:

```json
{
  "devDependencies": {
    "@lingui/swc-plugin": "6.6.0"
  }
}
```

See the [compatibility table](https://github.com/lingui/swc-plugin#compatibility) for the right version.

Do **not** add a Babel config to the project. Next.js would switch to Babel and the SWC plugin would no longer run.
