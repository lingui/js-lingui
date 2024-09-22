import { t, Trans } from "@lingui/macro";
import { json, type MetaFunction } from "@remix-run/node";
import { LocaleSelector } from "~/modules/lingui/lingui";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.title ?? t`An Unexpected Error Occured` },
    { name: "description", content: t`Welcome to Remix!` },
  ];
};

export function loader() {
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
