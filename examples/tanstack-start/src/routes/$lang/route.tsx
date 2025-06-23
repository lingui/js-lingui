import { Trans } from "@lingui/react/macro"
import { createFileRoute, Link, notFound, Outlet } from "@tanstack/react-router"
import { updateLocale } from "~/functions/locale"
import { dynamicActivate, locales } from "~/modules/lingui/i18n"

export const Route = createFileRoute("/$lang")({
  component: Page,
  async loader({ context, params }) {
    if (!Object.keys(locales).includes(params.lang)) {
      return notFound()
    }

    if (context.i18n.locale !== params.lang) {
      await updateLocale({ data: params.lang }) // Persist the locale in the cookies
      await dynamicActivate(context.i18n, params.lang)
    }
  },
})

function Page() {
  return (
    <>
      <Outlet />
      <hr />
      <div>
        <Trans>Check out other contents:</Trans>{" "}
        <Route.Link
          to="/$lang/content"
          activeProps={{ className: "font-bold" }}
        >
          <Trans>Content</Trans>
        </Route.Link>{" "}
        {"- "}
        <Route.Link
          to="/$lang/content-bis"
          activeProps={{ className: "font-bold" }}
        >
          <Trans>Content Bis</Trans>
        </Route.Link>
      </div>
    </>
  )
}
