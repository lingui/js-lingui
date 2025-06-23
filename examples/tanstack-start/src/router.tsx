import type { I18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import { createRouter as createTanStackRouter, type AnyRouter } from "@tanstack/react-router"
import { type PropsWithChildren } from "react"
import { routeTree } from "./routeTree.gen"
import { DefaultCatchBoundary } from "./components/DefaultCatchBoundary"
import { NotFound } from "./components/NotFound"
import { routerWithLingui } from "./modules/lingui/router-plugin"

export interface AppContext {
  i18n: I18n
}

export function createRouter({ i18n }: { i18n: I18n }) {
  const router = routerWithLingui(createTanStackRouter({
    routeTree,
    context: {
      i18n,
    },
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    scrollRestoration: true
  }), i18n)

  return router
}

type AppRouter = ReturnType<typeof createRouter>

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter
  }
}
