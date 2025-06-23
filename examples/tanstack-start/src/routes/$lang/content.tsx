import { Trans } from "@lingui/react/macro"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/$lang/content")({
  component: Page,
})

function Page() {
    return <div className="p-2">
      <h3>
        <Trans>Translated content from the URL.</Trans>
      </h3>
      <Link
        to="."
        params={{ lang: "fr" }}
        activeProps={{ className: "font-bold" }}
      >
        French
    </Link> - {" "}
    <Link
        to="."
        params={{ lang: "en" }}
        activeProps={{ className: "font-bold" }}
      >
        English
        </Link> - {" "}
    <Link
        to="."
        params={{ lang: "kl" }}
        activeProps={{ className: "font-bold" }}
      >
        Klingon
        </Link>
    </div>
}
