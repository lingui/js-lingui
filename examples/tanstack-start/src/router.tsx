import type { I18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { type PropsWithChildren } from "react"
import { routeTree } from "./routeTree.gen"
import { DefaultCatchBoundary } from "./components/DefaultCatchBoundary"
import { NotFound } from "./components/NotFound"

export interface AppContext {
  i18n: I18n
}

export function createRouter({ i18n }: { i18n: I18n }) {
  const router = createTanStackRouter({
    routeTree,
    context: {
      i18n,
    },
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    scrollRestoration: true,
    Wrap: ({ children }: PropsWithChildren) => {
      return <I18nProvider i18n={i18n}>{children}</I18nProvider>
    },
  })

  return router
}

type AppRouter = ReturnType<typeof createRouter>;

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter
  }
}
