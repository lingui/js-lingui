import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { loadCatalog, LocaleSelector } from "~/modules/lingui/lingui";
import { linguiServer } from "~/modules/lingui/lingui.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.title ?? t`An Unexpected Error Occured` },
    { name: "description", content: t`Welcome to Remix!` },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // Loaders run before entry.server.tsx activates a locale, and `t` needs one.
  await loadCatalog(await linguiServer.getLocale(request));

  return json({
    title: t`New Remix App`,
  })
}

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1><Trans>Welcome to Remix</Trans></h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            <Trans>15m Quickstart Blog Tutorial</Trans>
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            <Trans>Deep Dive Jokes App Tutorial</Trans>
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            <Trans>Remix Docs</Trans>
          </a>
        </li>
      </ul>
      <LocaleSelector />
    </div>
  );
}
