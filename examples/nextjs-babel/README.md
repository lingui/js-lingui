# Next.js Pages Router + Babel

Example of [Lingui](https://lingui.dev) in a [Next.js](https://nextjs.org/) 16 app that uses the Pages Router and the built-in [internationalized routing](https://nextjs.org/docs/pages/guides/internationalization). Macros are compiled by [`@lingui/babel-plugin-lingui-macro`](https://lingui.dev/ref/babel-plugin-lingui-macro), configured in `.babelrc`.

Looking for the App Router and React Server Components? See the [`nextjs-swc`](../nextjs-swc) example.

## Getting Started

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). Open [http://localhost:3000/cs](http://localhost:3000/cs) or [http://localhost:3000/pseudo](http://localhost:3000/pseudo) to see the page in another locale.

## How It Works

Next.js owns the locale routing, Lingui translates the pages.

- `next.config.ts` declares the locales, `lingui.config.ts` reads them from there.
- `src/i18n.ts` loads the catalog of a locale and creates the `I18n` instance.
- Each page loads its catalog in `getStaticProps`, `_app.tsx` provides it to the page.
- `src/components/LocaleSwitcher.tsx` switches the language with `router.push(..., { locale })`.

## Lingui Commands

Extract messages from the source code into `src/locales/*.po`:

```bash
yarn lingui:extract
```

`yarn build` runs the extraction before `next build`, so the catalogs are always up to date.

## Babel vs. SWC

The `.babelrc` in the project makes Next.js compile with Babel instead of SWC. That is what the Babel macro plugin needs, but it also makes builds slower. If you don't depend on Babel for anything else, prefer the SWC plugin shown in the [`nextjs-swc`](../nextjs-swc) example.
