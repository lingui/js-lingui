---
title: Lingui with React Server Components
description: Learn how to setup and use Lingui with RSC & Next.js
---

Lingui provides support for React Server Components (RSC) as of v4.10.0. In this tutorial, we'll learn how to add internationalization to an application with the Next.js app router. However, the same principles are applicable to any RSC-based solution.

:::tip Hint
There's a working example available [here](#). We will make references to the important parts of it throughout the tutorial. The example is more complete than this tutorial.

The example uses both pages router and app router, so you can see how to use Lingui with both in [this commit](#).
:::

Before going further, please follow the [React setup](/tutorials/setup-react?babel-or-swc=swc) for installation and configuration instructions (for SWC or Babel depending on which you use - most likely it's SWC). You may also need to configure your `tsconfig.json` according to [this visual guide](https://twitter.com/mattpocockuk/status/1724462050288587123). This is so that TypeScript understands the values exported from `@lingui/react` package.

### Adding i18n support to Next.js

Firstly, your Next.js app needs to be ready for routing and rendering of content in multiple languages. This is done through the middleware (see the [example app's middleware](#)). Please read the [official Next.js docs](https://nextjs.org/docs/app/building-your-application/routing/internationalization) for more information.

After configuring the middleware, make sure your page and route files are moved from `app` to `app/[lang]` folder (example: `app/[lang]/layout.tsx`). This enables the Next.js router to dynamically handle different locales in the route, and forward the `lang` parameter to every layout and page.

### Next.js Config

Secondly, add the `swc-plugin` to the `next.config.js`, so that you can use [Lingui macros](https://lingui.dev/ref/macro).

```js title="next.config.js"
/** @type {import('next').NextConfig} */
module.exports = {
  // to use Lingui macros
  experimental: {
    swcPlugins: [["@lingui/swc-plugin", {}]],
  },
};
```

### Setup with server components

With Lingui, the experience of localizing React is the same in client and server components: `Trans` and `useLingui` can be used identically in both worlds, even though internally there are two implementations.

:::tip Under the hood
Translation strings, one way or another, are obtained from an [I18n](/docs/ref/core.md) object instance. In client components, this instance is passed around using React context. Because context is not available in Server components, instead [`cache`](https://react.dev/reference/react/cache) is used to maintain an I18n instance for each request.
:::

To make Lingui work in both server and client components, we need to take the `lang` prop which Next.js will pass to our layouts and pages, and create a corresponding instance of the I18n object. We then make it available to the components in our app. This is a 2-step process:

1. given `lang`, take an I18n instance and store it in the [`cache`](https://react.dev/reference/react/cache) so it can be used server-side
2. given `lang`, take an I18n instance and make it available to client components via I18nProvider

This is how step (1) can be implemented:

```tsx title="src/app/[lang]/layout.tsx"
import { setI18n } from "@lingui/react/server";
import { allI18nInstances } from "./appRouterI18n";
import { LinguiClientProvider } from "./LinguiClientProvider";

type Props = {
  params: {
    lang: string;
  };
  children: React.ReactNode;
};

export default function RootLayout({ params: { lang }, children }: Props) {
  const i18n = allI18nInstances[lang]; // get a ready-made i18n instance for the given locale
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
Why we are not passing the I18n instance directly from `RootLayout` to the client via `LinguiClientProvider`? It's because the I18n object isn't serializable, and cannot be passed from server to client.
:::

Lastly, there's the `appRouterI18n.ts` file, which is only executed on server and holds one instance of I18n object for each locale of our application. See [here](#) how it's implemented in the example.

### Rendering translations in server and client components

Below you can see an example of a React component. This component can be rendered **both with RSC and on client**. This is great if you're migrating a Lingui-based project from pages router to app router because you can keep the same components working in both worlds.

In fact, if you swapped the html tags for their more universal alternatives, this component could also be used in React Native.

```tsx title="app/[lang]/components/SomeComponent.tsx"
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

export function SomeComponent() {
  const { i18n } = useLingui();
  return (
    <div>
      <p>
        <Trans>Some Item</Trans>
      </p>
      <p>{t(i18n)`Other Item`}</p>
    </div>
  );
}
```

As you might recall, hooks are not supported in RSC, so you might be surprised that this works. Under RSC, `useLingui` is actually not a hook but a simple function call which reads from the React `cache` mentioned above.

The [RSC implementation](https://github.com/lingui/js-lingui/blob/ec49d0cc53dbc4f9e0f92f0edcdf59f3e5c1de1f/packages/react/src/index-rsc.ts#L12) of `useLingui` uses `getI18n`, which is another way to obtain the I18n instance on the server.

### Pages, Layouts and Lingui

There's one last caveat: in a real-world app, you will need to localize many pages, and layouts. Because of the way the app router is designed, the `setI18n` call needs to happen not only in layouts, but also in pages. Read more in:

- [Why do nested layouts/pages render before their parent layouts?](https://github.com/vercel/next.js/discussions/53026)
- [On navigation, layouts preserve state and do not re-render](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#layouts)

This means you need to repeat the `setI18n` in every page and layout. Luckily, you can easily factor it out into a simple function call, or create a HOC with which you'll wrap pages and layouts [as seen here](#). Please let us know if there's a known better way.

### Changing the active language

Most likely, your users will not need to change the language of the application because it will render in their preferred language (obtained from the `accept-language` header in the [middleware](#)), or with a fallback.

To change language, redirect users to a page with the new locale in the url. We do not recommend [dynamic](/guides/dynamic-loading-catalogs.md)switching because server-rendered locale-dependent content would become stale.

### Static Rendering Pitfall

Next.js can use [static rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#static-rendering-default) where it renders your pages only once at build time and then serves them to all users.

To ensure static rendering takes into account the supported locales, implement [generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) which will build the content for all locales.

It's important that you do not create any locale-dependent strings at a place in the app where locale may not be initialized correctly at build time. This could result in the content being generated only for one locale, and for this reason we do not recommend using the global i18n object in such scenarios. For example:

```tsx
import { i18n } from "@lingui/core";
import { t } from "@lingui/macro";
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

Read more about [lazy translation](/docs/tutorials/react-patterns.md#translations-outside-react-components) to see how to handle translation defined on the module level.

## Further reading

- [Common i18n patterns in React](/docs/tutorials/react-patterns.md)
- [`@lingui/react` reference documentation](/docs/ref/react.md)
