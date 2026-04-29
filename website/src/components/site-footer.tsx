import React from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { ExternalLink } from "lucide-react";

type FooterColumn = {
  title: string;
  links: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
};

const COLUMNS: FooterColumn[] = [
  {
    title: "Docs",
    links: [
      { label: "Configuration", href: "/ref/conf" },
      { label: "Macros", href: "/ref/macro" },
      { label: "CLI", href: "/ref/cli" },
      { label: "llms.txt", href: "/llms.txt", external: true },
      { label: "llms-full.txt", href: "/llms-full.txt", external: true },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discord", href: "https://discord.gg/tBZqKpeF", external: true },
      {
        label: "Stack Overflow",
        href: "https://stackoverflow.com/questions/tagged/linguijs",
        external: true,
      },
      { label: "Discussions", href: "https://github.com/lingui/js-lingui/discussions", external: true },
    ],
  },
  {
    title: "More",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "X", href: "https://x.com/LinguiJS", external: true },
      { label: "GitHub", href: "https://github.com/lingui/js-lingui", external: true },
    ],
  },
];

const footerLinkClass =
  "inline-flex items-center gap-1.5 text-base leading-relaxed text-zinc-400 no-underline transition-colors hover:text-zinc-100 hover:no-underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function InternalFooterLink(props: { label: string; href: string }): React.ReactElement {
  const to = useBaseUrl(props.href);
  return (
    <Link to={to} className={footerLinkClass}>
      <span>{props.label}</span>
    </Link>
  );
}

function ExternalFooterLink(props: { label: string; href: string }): React.ReactElement {
  return (
    <a href={props.href} target="_blank" rel="noreferrer noopener" className={footerLinkClass}>
      <span>{props.label}</span>
      <ExternalLink className="size-3.5 shrink-0 opacity-60" aria-hidden />
    </a>
  );
}

function FooterLinkItem(props: { label: string; href: string; external?: boolean }): React.ReactElement {
  if (props.external) {
    return <ExternalFooterLink label={props.label} href={props.href} />;
  }
  return <InternalFooterLink label={props.label} href={props.href} />;
}

export function SiteFooter(): React.ReactElement {
  return (
    <footer className="bg-[#282d37] px-4 pb-14 pt-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <nav className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3" aria-label="Footer">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-xl font-medium tracking-tight text-white">{col.title}</p>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem {...link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
