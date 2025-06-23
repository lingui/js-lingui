/// <reference types="vite/client" />
import { useLingui } from "@lingui/react"
import { Trans } from "@lingui/react/macro"
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useParams,
  useRouter,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { createServerFn } from "@tanstack/react-start"
import { setHeader } from "@tanstack/react-start/server"
import { serialize } from "cookie-es"
import * as React from "react"
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary"
import { NotFound } from "~/components/NotFound"
import { updateLocale } from "~/functions/locale"
import { dynamicActivate, locales } from "~/modules/lingui/i18n"
import type { AppContext } from "~/router"
import appCss from "~/styles/app.css?url"
import { seo } from "~/utils/seo"

export const Route = createRootRouteWithContext<AppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title:
          "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { i18n } = useLingui()
  const router = useRouter()
  const params = useParams({ strict: false })

  return (
    <html lang={i18n.locale}>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="p-2 flex gap-2 text-lg">
          <Link
            to="/"
            activeProps={{
              className: "font-bold",
            }}
            activeOptions={{ exact: true }}
          >
            <Trans>Home</Trans>
          </Link>{" "}
          <Link
            to="/posts"
            activeProps={{
              className: "font-bold",
            }}
          >
            <Trans>Posts</Trans>
          </Link>{" "}
          <Link
            to="/users"
            activeProps={{
              className: "font-bold",
            }}
          >
            <Trans>Users</Trans>
          </Link>{" "}
          <Link
            to="/route-a"
            activeProps={{
              className: "font-bold",
            }}
          >
            <Trans>Pathless Layout</Trans>
          </Link>{" "}
          <Link
            to="/deferred"
            activeProps={{
              className: "font-bold",
            }}
          >
            <Trans>Deferred</Trans>
          </Link>{" "}
          <Link
            to="/$lang/content"
            params={{ lang: i18n.locale }}
            activeProps={{
              className: "font-bold",
            }}
          >
            <Trans>URL</Trans>
          </Link>{" "}
          <Link
            // @ts-expect-error
            to="/this-route-does-not-exist"
            activeProps={{
              className: "font-bold",
            }}
          >
            <Trans>This Route Does Not Exist</Trans>
          </Link>
          |
          {Object.entries(locales).map(([locale, label]) => (
            <button
              key={locale}
              className={locale === i18n.locale ? "font-bold" : ""}
              onClick={() => {
                updateLocale({ data: locale }).then(async () => {
                  await dynamicActivate(i18n, locale)

                  if (params.lang) {
                    // Redirect to the new locale path
                    await router.navigate({ to: ".", params: { lang: locale }})
                  }

                  await router.invalidate()
                })
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <hr />
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
