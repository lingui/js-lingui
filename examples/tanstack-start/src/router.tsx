import type { I18n } from "@lingui/core"
import {
  createRouter as createTanStackRouter,
} from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { DefaultCatchBoundary } from "./components/DefaultCatchBoundary"
import { NotFound } from "./components/NotFound"
import { routerWithLingui } from "./modules/lingui/router-plugin"
import { getI18n } from "./modules/lingui/i18n"

export interface AppContext {
  i18n: I18n
}

export function getRouter() {
  const i18n = getI18n()

  const router = routerWithLingui(
    createTanStackRouter({
      routeTree,
      context: {
        i18n,
      },
      defaultErrorComponent: DefaultCatchBoundary,
      defaultNotFoundComponent: () => <NotFound />,
      scrollRestoration: true,
    }),
    i18n
  )

  return router
}

type AppRouter = ReturnType<typeof getRouter>

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter
  }
}
