---
title: Next.js App Router i18n with React Server Components
description: Add internationalization to a Next.js App Router app with Lingui. Set up the SWC plugin, load catalogs in server and client components and switch languages
---

Lingui provides support for React Server Components (RSC) as of v4.10.0. In this tutorial, we'll learn how to add internationalization to an application with the Next.js [App Router](https://nextjs.org/docs/app). However, the same principles are applicable to any RSC-based solution.

:::tip Example
There's a working example available [here](https://github.com/lingui/js-lingui/tree/main/examples/nextjs-swc). We will make references to the important parts of it throughout the tutorial. The example is more complete than this tutorial.

The example uses both Pages Router and App Router, so you can see how to use Lingui with both in [this commit](https://github.com/lingui/js-lingui/pull/1944/commits/100fc74abb49cff677f4b1cac1dfd5da60262b67).
:::

Before going further, please follow the [Installation and Setup](/installation?transpiler=swc) instructions (for SWC or Babel depending on which you use - most likely it's SWC). You may also need to configure your `tsconfig.json` according to [this visual guide](https://twitter.com/mattpocockuk/status/1724462050288587123). This is so that TypeScript understands the values exported from `@lingui/react` package.

### Adding i18n Support to Next.js

Firstly, your Next.js app needs to be ready for routing and rendering of content in multiple languages. This is done through the proxy, called middleware before Next.js 16 (see the [example app's proxy](https://github.com/lingui/js-lingui/blob/main/examples/nextjs-swc/src/proxy.ts)). Please read the [official Next.js docs](https://nextjs.org/docs/app/guides/internationalization) for more information.

After configuring the proxy, make sure your page and route files are moved from `app` to `app/[lang]` folder (example: `app/[lang]/layout.tsx`). This enables the Next.js router to dynamically handle different locales in the route. Because `[lang]` sits above the root layout, it's a root parameter: since Next.js 16.3, any Server Component can read it with [`next/root-params`](https://nextjs.org/docs/app/api-reference/functions/next-root-params), without passing `params` down from layouts and pages.

### Next.js Config

Secondly, add the `swc-plugin` to the Next.js config, so that you can use [Lingui Macros](/ref/macro).

```js title="next.config.mjs"
import { linguiMacroSwcPlugin } from "@lingui/swc-plugin/options";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // to use Lingui macros
  experimental: {
    swcPlugins: [linguiMacroSwcPlugin()],
  },
};

export default nextConfig;
```

### Setup with Server Components

With Lingui, the experience of localizing React is the same in client and server components: `Trans` and `useLingui` can be used identically in both worlds, even though internally there are two implementations.

:::tip Under the hood
Translation strings, one way or another, are obtained from an [I18n](/ref/core) object instance. In client components, this instance is passed around using React context. Because context is not available in Server components, instead [`cache`](https://react.dev/reference/react/cache) is used to maintain an I18n instance for each request.
:::

To make Lingui work in both server and client components, we need to take the `lang` of the current request and create a corresponding instance of the I18n object. We then make it available to the components in our app. This is a 2-step process:

1. given `lang`, take an I18n instance and store it in the [`cache`](https://react.dev/reference/react/cache) so it can be used server-side
2. given `lang`, take an I18n instance and make it available to client components via `I18nProvider`

Step (1) fits in a small helper. It reads `lang` with `next/root-params`, so it doesn't need any arguments:

```ts title="src/initLingui.ts"
import { lang } from "next/root-params";
import { setI18n } from "@lingui/react/server";
import { getI18nInstance } from "./appRouterI18n";

export async function initLingui() {
  const i18n = getI18nInstance(await lang()); // get a ready-made i18n instance for the current locale
  setI18n(i18n); // make it available server-side for the current request
  return i18n;
}
```

The root layout calls it, and so does `generateMetadata`:

```tsx title="src/app/[lang]/layout.tsx"
import { msg } from "@lingui/core/macro";
import { initLingui } from "../../initLingui";
import { LinguiClientProvider } from "./LinguiClientProvider";

export async function generateMetadata() {
  const i18n = await initLingui();

  return {
    title: i18n._(msg`Translation Demo`),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const i18n = await initLingui();

  return (
    <html lang={i18n.locale}>
      <body>
        <LinguiClientProvider initialLocale={i18n.locale} initialMessages={i18n.messages}>
          {children}
        </LinguiClientProvider>
      </body>
    </html>
  );
}
```

:::note Next.js older than 16.3
`next/root-params` isn't available before Next.js 16.3. Take `lang` from the `params` prop that Next.js passes to every layout and page, and pass it to the helper instead:

```tsx
export function initLingui(lang: string) {
  const i18n = getI18nInstance(lang);
  setI18n(i18n);
  return i18n;
}

type Props = {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
};

export default async function RootLayout({ params, children }: Props) {
  const { lang } = await params;
  const i18n = initLingui(lang);
  // ...render the same tree as above
}
```

In Next.js 14 and older, `params` is a plain object rather than a promise.
:::

:::caution
Root parameter getters such as `lang()` only work in Server Components and the server-side code they call. They aren't available in Client Components, Server Actions, or Route Handlers: pass the locale explicitly there, for example as an argument from the component that calls the Server Action.

Inside a [`"use cache"`](https://nextjs.org/docs/app/api-reference/directives/use-cache) function, Next.js adds the root parameters you read to the cache key, so `getI18nInstance(await lang())` gives you one cache entry per locale. Calling `lang()` inside `unstable_cache` throws an error.
:::

Step (2) is implemented in `LinguiClientProvider`, which is a client component:

```tsx title="LinguiClientProvider.tsx"
"use client";

import { I18nProvider } from "@lingui/react";
import { type Messages, setupI18n } from "@lingui/core";
import { useState } from "react";

export function LinguiClientProvider({
  children,
  initialLocale,
  initialMessages,
}: {
  children: React.ReactNode;
  initialLocale: string;
  initialMessages: Messages;
}) {
  const [i18n] = useState(() => {
    return setupI18n({
      locale: initialLocale,
      messages: { [initialLocale]: initialMessages },
    });
  });
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}
```

:::tip
Why are we not passing the I18n instance directly from `RootLayout` to the client via `LinguiClientProvider`? It's because the I18n object isn't serializable, and cannot be passed from server to client.
:::

Lastly, there's the `appRouterI18n.ts` file, which is only executed on server and holds one instance of I18n object for each locale of our application. See [here](https://github.com/lingui/js-lingui/blob/main/examples/nextjs-swc/src/appRouterI18n.ts) how it's implemented in the example app.

### Rendering Translations in Server and Client Components

Below you can see an example of a React component. This component can be rendered **both with RSC and on client**. This is great if you're migrating a Lingui-based project from pages router to App Router because you can keep the same components working in both worlds.

In fact, if you swapped the html tags for their more universal alternatives, this component could also be used in React Native.

```tsx title="app/[lang]/components/SomeComponent.tsx"
import { Trans, useLingui } from "@lingui/react/macro";

export function SomeComponent() {
  const { t } = useLingui();
  return (
    <div>
      <p>
        <Trans>Some Item</Trans>
      </p>
      <p>{t`Other Item`}</p>
    </div>
  );
}
```

As you may recall, hooks are not supported in RSC, so you might be surprised that this works. Under RSC, `useLingui` is actually not a hook but a simple function call which reads from the React `cache` mentioned above.

The [RSC implementation](https://github.com/lingui/js-lingui/blob/ec49d0cc53dbc4f9e0f92f0edcdf59f3e5c1de1f/packages/react/src/index-rsc.ts#L12) of `useLingui` uses `getI18n`, which is another way to obtain the I18n instance on the server.

### Pages, Layouts and Lingui

There's one last caveat: in a real-world app, you will need to localize many pages, and layouts. Because of the way the App Router is designed, the `setI18n` call needs to happen not only in layouts, but also in pages. Read more in:

- [Why do nested layouts/pages render before their parent layouts?](https://github.com/vercel/next.js/discussions/53026)
- [On navigation, layouts preserve state and do not re-render](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#layouts)

`next/root-params` doesn't change this. Lingui's server-side `Trans` and `useLingui` read the I18n instance synchronously from the React `cache`, so it has to be set before they render, in every page and layout. What root params remove is the need to thread `params` through each of them: the call becomes a one-liner without arguments.

```tsx title="src/app/[lang]/some-page/page.tsx"
import { initLingui } from "../../../initLingui";
import { SomeComponent } from "../components/SomeComponent";

export default async function Page() {
  await initLingui();
  return <SomeComponent />;
}
```

See [`initLingui.tsx`](https://github.com/lingui/js-lingui/blob/main/examples/nextjs-swc/src/initLingui.tsx) in the example app.

### Changing the Active Language

Most likely, your users will not need to change the language of the application because it will render in their preferred language (obtained from the `accept-language` header in the [proxy](https://github.com/lingui/js-lingui/blob/main/examples/nextjs-swc/src/proxy.ts)), or with a fallback.

To change language, redirect users to a page with the new locale in the url. We do not recommend [dynamic](/guides/dynamic-loading-catalogs.md) switching because server-rendered locale-dependent content would become stale.

### Static Rendering Pitfall

Next.js can use [static rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#static-rendering-default) where it renders your pages only once at build time and then serves them to all users.

To ensure static rendering takes into account the supported locales, implement [generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) which will build the content for all locales.

It's important that you do not create any locale-dependent strings at a place in the app where locale may not be initialized correctly at build time. This could result in the content being generated only for one locale, and for this reason we do not recommend using the global i18n object in such scenarios. For example:

```tsx
import { i18n } from "@lingui/core";
import { t } from "@lingui/core/macro";
// 😰 if this code runs at build time, it'll always be in the locale
// which the imported global i18n object had at that time
const immutableGreeting = t(i18n)`Hello World`;

// ✅ this component will be statically rendered for each locale
// (specified with `generateStaticParams`)
export default function SomePage() {
  return (
    <>
      <Trans>Hello world</Trans> {/* this is fine */}
    </>
  );
}
```

Read more about [Lazy Translation](/guides/lazy-translations) to see how to handle translation defined on the module level.

## See Also

- [React i18n Tutorial](/tutorials/react)
- [`@lingui/react` Reference](/ref/react)
