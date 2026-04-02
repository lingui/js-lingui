import React from "react";

export function PartnerBanner(): React.ReactElement {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 text-center">
        <a
          href="https://crowdin.com/?utm_source=lingui.dev&utm_medium=referral&utm_campaign=lingui.dev"
          target="_blank"
          rel="noreferrer"
          className="text-body-fg inline-flex flex-col items-center gap-2 no-underline hover:no-underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="text-secondary text-xs font-medium tracking-wide">Presented by</span>
          <span className="flex items-center justify-center">
            <img
              className="h-8 w-auto"
              alt="Crowdin"
              src="https://support.crowdin.com/assets/logos/core-logo/png/crowdin-core-logo-cDark.png#gh-light-mode-only"
              height={32}
            />
            <img
              className="h-8 w-auto"
              alt="Crowdin"
              src="https://support.crowdin.com/assets/logos/core-logo/png/crowdin-core-logo-cWhite.png#gh-dark-mode-only"
              height={32}
            />
          </span>
          <p className="text-secondary m-0 text-base leading-snug">Agile localization for tech companies</p>
        </a>
      </div>
    </section>
  );
}
