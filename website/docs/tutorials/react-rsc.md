---
title: Lingui with React Server Components
description: Learn how to setup and use Lingui with RSC & Next.js
---

Lingui provides support for React Server Components (RSC) as of v4.10.0. In this tutorial, we'll learn how to add internationalization to an application with the Next.js [App Router](https://nextjs.org/docs/app). However, the same principles are applicable to any RSC-based solution.

:::tip Example
There's a working example available [here](https://github.com/lingui/js-lingui/tree/main/examples/nextjs-swc). We will make references to the important parts of it throughout the tutorial. The example is more complete than this tutorial.

The example uses both Pages Router and App Router, so you can see how to use Lingui with both in [this commit](https://github.com/lingui/js-lingui/pull/1944/commits/100fc74abb49cff677f4b1cac1dfd5da60262b67).
:::

Before going further, please follow the [Installation and Setup](/installation?transpiler=swc) instructions (for SWC or Babel depending on which you use - most likely it's SWC). You may also need to configure your `tsconfig.json` according to [this visual guide](https://twitter.com/mattpocockuk/status/1724462050288587123). This is so that TypeScript understands the values exported from `@lingui/react` package.

### Adding i18n Support to Next.js

Firstly, your Next.js app needs to be ready for routing and rendering of content in multiple languages. This is done through the middleware (see the [example app's middleware](https://github.com/lingui/js-lingui/blob/main/examples/nextjs-swc/src/middleware.ts)). Please read the [official Next.js docs](https://nextjs.org/docs/app/building-your-application/routing/internationalization) for more information.

After configuring the middleware, make sure your page and route files are moved from `app` to `app/[lang]` folder (example: `app/[lang]/layout.tsx`). This enables the Next.js router to dynamically handle different locales in the route, and forward the `lang` parameter to every layout and page.

### Next.js Config

Secondly, add the `swc-plugin` to the `next.config.mjs` (or `next.config.js`), so that you can use [Lingui Macros](/ref/macro).

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

To make Lingui work in both server and client components, we need to take the `lang` prop which Next.js passes to our layouts and pages, and create a corresponding instance of the I18n object. We then make it available to the components in our app. This is a 2-step process:

1. given `lang`, take an I18n instance and store it in the [`cache`](https://react.dev/reference/react/cache) so it can be used server-side
2. given `lang`, take an I18n instance and make it available to client components via `I18nProvider`

This is how step (1) can be implemented:

```tsx title="src/app/[lang]/layout.tsx"
import { setI18n } from "@lingui/react/server";
import { getI18nInstance } from "./appRouterI18n";
import { LinguiClientProvider } from "./LinguiClientProvider";

type Props = {
  params: Promise<{
    lang: string;
  }>;
  children: React.ReactNode;
};

export default async function RootLayout({ params, children }: Props) {
  const { lang } = await params; // Next.js 15+ passes params as a Promise
  const i18n = getI18nInstance(lang); // get a ready-made i18n instance for the given locale
  setI18n(i18n); // make it available server-side for the current request

  return (
    <html lang={lang}>
      <body>
        <LinguiClientProvider initialLocale={lang} initialMessages={i18n.messages}>
          <YourApp />
        </LinguiClientProvider>
      </body>
    </html>
  );
}
```

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

The [RSC implementation](https://github.com/lingui/js-lingui/blob/main/packages/react/src/index-rsc.ts) of `useLingui` uses `getI18nOrThrow` to obtain the current Lingui context, which contains the I18n instance.

### Using Lingui in Server Functions

Server Functions are available in React 19 and later. Next.js commonly exposes them as _Server Actions_. Choose the API based on where the translation happens:

| Situation                                                          | API                                            |
| ------------------------------------------------------------------ | ---------------------------------------------- |
| The function already has an `i18n` instance                        | Call `i18n.t(...)` directly                    |
| Server Component render                                            | Call `setI18n(i18n)`                           |
| React 19+ Server Function or Server Action with downstream helpers | Wrap the work in `runWithI18n(i18n, callback)` |

Server Functions run outside the Server Component render that initialized Lingui. Unlike the RSC-only `setI18n`, `runWithI18n` scopes the instance to its callback and the asynchronous operations created inside it:

```tsx title="app/actions.ts"
"use server";

import { setupI18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { getI18nOrThrow, runWithI18n } from "@lingui/react/server";
import { getCurrentUser } from "./auth";

async function translateGreeting() {
  const user = await getCurrentUser();
  const { i18n } = getI18nOrThrow();

  return i18n.t(msg`Hello, ${user.name}!`);
}

export async function getGreeting(locale: string) {
  const i18n = setupI18n({
    locale,
    messages: { [locale]: await loadMessages(locale) }, // your compiled catalog loader
  });

  return runWithI18n(i18n, translateGreeting);
}
```

`i18n` is local to `getGreeting`, so `translateGreeting` cannot access it directly. You could pass the instance as an argument, but `runWithI18n` and `getI18nOrThrow` avoid threading it through every helper in a deeper call chain. The `await` in `translateGreeting` also shows that the context remains available throughout asynchronous work created inside the callback. Nested and concurrent callbacks keep their contexts isolated.

`AsyncLocalStorage` stores a reference to the instance; it does not clone or serialize it. Create a separate `i18n` instance for each Server Function invocation instead of changing one shared global instance from concurrent requests.

An active Server Component render always uses its own React cache. It does not inherit the Server Function context, so call `setI18n` when entering a nested RSC render.

`runWithI18n` works in any runtime that provides `AsyncLocalStorage` from `node:async_hooks`: Node.js, the Vercel Edge Runtime, and Cloudflare Workers. On Cloudflare Workers, enable the [`nodejs_compat`](https://developers.cloudflare.com/workers/runtime-apis/nodejs/) (or `nodejs_als`) compatibility flag. Keep the asynchronous work inside the callback on native promises — on edge runtimes, context can be lost across custom thenables.

If the translation happens directly inside `getGreeting`, use ``i18n.t(msg`Hello, world!`)`` instead. Use `getI18nOrThrow` in helpers that require the context, or nullable `getI18n` when the context is optional.

### Pages, Layouts and Lingui

There's one last caveat: in a real-world app, you will need to localize many pages, and layouts. Because of the way the App Router is designed, the `setI18n` call needs to happen not only in layouts, but also in pages. Read more in:

- [Why do nested layouts/pages render before their parent layouts?](https://github.com/vercel/next.js/discussions/53026)
- [On navigation, layouts preserve state and do not re-render](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#layouts)

This means you need to repeat the `setI18n` in every page and layout. Luckily, you can easily factor it out into a simple function call, or create a HOC with which you'll wrap pages and layouts [as seen here](https://github.com/lingui/js-lingui/blob/main/examples/nextjs-swc/src/initLingui.tsx). Please let us know if there's a known better way.

### Changing the Active Language

Most likely, your users will not need to change the language of the application because it will render in their preferred language (obtained from the `accept-language` header in the [middleware](https://github.com/lingui/js-lingui/blob/2f1c1c3ae9e079c1c0e1a2ff617b1d0775af3170/examples/nextjs-swc/src/middleware.ts#L30)), or with a fallback.

To change language, redirect users to a page with the new locale in the url. We do not recommend [dynamic](/guides/dynamic-loading-catalogs.md) switching because server-rendered locale-dependent content would become stale.

### Static Rendering Pitfall

Next.js can use [static rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#static-rendering-default) where it renders your pages only once at build time and then serves them to all users.

To ensure static rendering takes into account the supported locales, implement [generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) which will build the content for all locales.

It's important that you do not create any locale-dependent strings at a place in the app where locale may not be initialized correctly at build time. This could result in the content being generated only for one locale, and for this reason we do not recommend using the global i18n object in such scenarios. For example:

```tsx
import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
// 😰 if this code runs at build time, it'll always be in the locale
// which the imported global i18n object had at that time
const immutableGreeting = i18n.t(msg`Hello World`);

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
