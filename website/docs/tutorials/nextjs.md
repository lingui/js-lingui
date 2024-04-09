---
title: Setup Lingui in Next.js
description: Learn how to setup and use Lingui with Next.js
---

### Installation

After creating your Next.js project install the Lingui dependencies. Make sure to install a version greater or equal to [4.8.0](https://github.com/lingui/js-lingui/releases/tag/v4.8.0). 

```
npm i @lingui/core @lingui/react
```

```
npm i -D @lingui/cli @lingui/loader @lingui/macro @lingui/swc-plugin
```

### Config

In the `next.config.js` file we can add 2 configurations to make our life a little easier. The `swc-plugin` to be able to use [Lingui macros](https://lingui.dev/ref/macro) and the [`@lingui/loader`](https://lingui.dev/ref/loader) to load translation files without compiling them to js first. Both steps are optional if you for example are not using macros.

```js
//next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  // to use lingui macros
  experimental: {
    swcPlugins: [
      ['@lingui/swc-plugin', {}],
    ],
  },
  // To import .po (or other formats) translation files directly  
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.po/,
      use: [
        options.defaultLoaders.babel,
        {
          loader: '@lingui/loader',
        },
      ],
    })
    return config
  },
}
```

Also add a global declaration of the `*.po` file type and its contents to get Typescript on the same page.

```ts
declare module "*.po" {
    export const messages: any
}
```

## Setup with server components

Since version 13+ Next.js allows you to use [server components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) using the app directory. Lingui can easily be used with server components. There are however some considerations to be made so we can make optimal use of server components and it's capabilities. 

1. We want to avoid shipping to much js to the browser if it is not needed
2. We want to be able to easily distinguish between client component translations (part of the js bundle) and server component translations.

The example below shows how you can setup Lingui to work with sever components in Next.js.

In Next.js 13+ it is a common pattern to add a `[locale]` dir at the root of your app to facilitate i18n. This parameter will correspond the the language of the page visited by the user. e.g. english `en` and french `fr`. When we switch between languages we will redirect the user to the new language url instead of the client side approach of calling `i18n.activate(locale)`.

```tsx
// src/app/[locale]/layout.tsx
import { t } from '@lingui/macro'
import I18nProvider from '@/components/I18nProvider'
import { loadCatalog, setI18n } from '@/utils/locales'

type Params = {
  locale: string
}

type Props = {
  params: Params
  children: React.ReactNode
}

export function generateMetadata({ params }: { params: Params }) {
  const { locale } = params
  const i18n = setI18n(locale)
  return {
    title: t(i18n)`Translation Demo`, // this is an example of a server only translation
  }
}

export function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'fr' }]
}

export default function RootLayout({ params, children }: Props) {
    const { locale } = params
    const messages = loadCatalog(locale)
    setI18n(locale)
    return (
        <html lang={locale}>
            <body>
                <I18nProvider locale={locale} messages={messages}>
                    {children}
                </I18nProvider>
            </body>
        </html>
    )
}
```

You can use the Next.js middleware to [redirect to the default language](https://nextjs.org/docs/app/building-your-application/routing/internationalization) if the root `/` is visited.

```ts
// src/middleware.ts
import { NextResponse, NextRequest } from "next/server"
 
const locales = ['en', 'fr']
 
export function middleware(req : NextRequest) {
  const { pathname } = req.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  if (pathnameHasLocale) return
 
  const defaultLocale = 'en' // or find the "accept-language" in the header
  req.nextUrl.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(req.nextUrl)
}
 
export const config = {
  matcher: [
    '/((?!_next).*)',
  ],
}
```

As you can see in the example above we slight modified the default `I18nProvider` with our own implementation. Here we pass the active message catalog as a prop. This is to avoid importing all catalogs inside the `I18nProvider` component itself and thus making them part of the client bundle. For the people who are wondering: Why we are not just passing an instance of `i18n` the original provider component? Server components can pass data to client components but the caveat is that this needs to be serializable data and `i18n` is not.

```tsx
// src/components/I18nProvider.ts
'use client'

import { setupI18n } from '@lingui/core'
import { I18nProvider as LinguiProvider } from '@lingui/react'

type Props = {
  locale: string
  messages?: any
  children: React.ReactNode
}

export function I18nProvider({ locale, messages, ...props }: Props) {
  return (
    <LinguiProvider
      i18n={setupI18n({
        locale,
        messages: { [locale]: messages },
      })}
      {...props}
    />
  );
}
```

In the code below we take a closer look at `loadMessages` and `setI18n` function in the layout file. The `loadMessages` function will just return the correct catalog based on the locale. The function `setI18n` is more exotic. This uses a new react feature called [`cache`](https://react.dev/reference/react/cache). The React cache function allows you to memoize the return value of a function, allowing you to call the same function multiple times while only executing it once. This is useful in that we can set an instance of `i18n` for later usage in our nested server components.

:::note
The file `locales.ts` below imports all catalogs so it is important that you don't import this file into a client component otherwise all catalogs will be part of the js bundle. This is not dramatic but as we said before we want to avoid shipping unnecessary js to the browser if possible.
:::

```ts
// src/utils/locales.ts
// Do not use import this file in client component
import { cache } from 'react'
import { setupI18n } from '@lingui/core'
import { messages as en } from '@/locales/en.po'
import { messages as fr } from '@/locales/fr.po'

export function loadCatalog(locale: string) {
    if (locale === 'fr') {
        return fr
    }
    return en
}

const getLinguiCache = cache((): { current: I18n } => ({
    current: setupI18n({
        locale: 'en',
        messages: { en },
    }),
}))

export function setI18n(locale: string) {
    const messages = loadCatalog(locale);
    getLinguiCache().current = setupI18n({
        locale,
        messages: { [locale]: messages },
    })
    return getLinguiCache().current
}


export function getI18n() {
    const i18n = getLinguiCache().current
    if (!i18n) {
        throw new Error('No i18n instance has been setup. Make sure to call `setI18n` first in root of your RSC tree before using `getI18n`');
    }
    return i18n
}
```

Below you can see how we can use the `Trans` component and the `getI18n` and `setI18n` helpers inside pages and components. 

:::note
In Next.js pages are rendered before the wrapping layout. This means that we need to call `setI18n` both in our wrapping layout and in each page so nested components can make use of the helper function. [Read more](https://github.com/vercel/next.js/discussions/53026)
:::

```tsx
// src/[locale]/page.tsx
import { Trans, t } from '@lingui/macro'
import { getI18n } from '@/utils/locales'
import Header from '@/components/Header'

type Params = {
  locale: string
}

type Props = {
  params: Params
  children: React.ReactNode
}

export default function Page({ params }: Props) {
    const { locale } = params;
    const i18n = setI18n(locale) // Sets the i18n instance up for all (server component) children
    return (
        <main>
            <Header>
            <div>
                <Trans>Hello</Trans> {/* ⚠️ Trans is rendered on the server but will be part of the js bundle. It will use the wrapping I18nProvider to get it i18n instance */}
                {t(i18n)`World`} {/* ✅ Will not be part of the js bundle */}
            </div>
        </main>
    )
}
```

Below you can see an example of a nested server component. The `getI18n` helper can be used to fetch the current `i18n` instance. You can think of this as `useLingui` hook but for server components.

```tsx
// src/components/Header.tsx
import { Trans, t } from '@lingui/macro'
import { getI18n } from '@/utils/locales'

export default function Header() {
    const i18n = getI18n() // will get the i18n instance set by page or layout component
    return (
        <nav>
            <ul>
                <li>
                    <Trans>Home</Trans> {/* ⚠️ Trans is rendered on the server but will be part of the js bundle. It will use the wrapping I18nProvider to get it i18n instance. */}
                </li>
                <li>
                    {t(i18n)`User`} {/* ✅ Will not be part of the js bundle */}
                </li>
            </ul>
        </nav>
    )
}
```

Finally an example of a locale switcher.

```tsx
'use client'

import { useRouter, useParams } from 'next/navigation'
import { t, msg } from '@lingui/macro'
import { MessageDescriptor } from '@lingui/core/src'
import { useLingui } from '@lingui/react'

type LOCALES = 'en' | 'fr'

const languages: { [key: string]: MessageDescriptor } = {
  en: msg`English`,
  sr: msg`French`,
}

export function LocaleSwitcher() {
  const router = useRouter()
  const { locale } = useParams<{ locale: string }>()
  const { i18n } = useLingui()
  const currentLocale = locale!.split('-')[0]

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const locale = event.target.value as LOCALES
    router.push(`/${locale}`)
  }

  return (
    <select value={currentLocale} onChange={handleChange}>
      {Object.keys(languages).map((locale) => {
        return (
          <option value={locale} key={locale}>
            {i18n._(languages[locale as unknown as LOCALES])}
          </option>
        )
      })}
    </select>
  )
}
```

