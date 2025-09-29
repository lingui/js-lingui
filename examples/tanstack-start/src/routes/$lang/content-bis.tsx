import { Trans } from "@lingui/react/macro"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Route as LangRoute } from "~/routes/$lang/route"

export const Route = createFileRoute("/$lang/content-bis")({
  component: Page,
})

function Page() {
  return (
    <div className="p-2">
      <h3>
        <Trans>Another translated content from the URL.</Trans>
      </h3>
      <div>
        <Trans>Check this content in other languages:</Trans>{" "}
        <Link
          to="."
          params={{ lang: "fr" }}
          activeProps={{ className: "font-bold" }}
        >
          French
        </Link>{" "}
        -{" "}
        <Link
          to="."
          params={{ lang: "en" }}
          activeProps={{ className: "font-bold" }}
        >
          English
        </Link>{" "}
        -{" "}
        <Link
          to="."
          params={{ lang: "kl" }}
          activeProps={{ className: "font-bold" }}
        >
          Klingon
        </Link>
      </div>
    </div>
  )
}
