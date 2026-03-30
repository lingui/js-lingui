import React from "react";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import { Button } from "./ui/button";
import cx from "clsx";

interface FeatureDetails {
  title: string;
  description: JSX.Element;
  image: string;
  className?: string;
}

const FEATURES: FeatureDetails[] = [
  {
    title: "Universal",
    description: (
      <p>
        Use it everywhere.{" "}
        <a href="/ref/core">
          <code>@lingui/core</code>
        </a>{" "}
        provides the essential intl functionality which works in any JavaScript project, while{" "}
        <a href="/ref/react">
          <code>@lingui/react</code>
        </a>{" "}
        offers components for leveraging React rendering, including React Server Components (RSC) support.
      </p>
    ),
    image: "universal.svg",
  },
  {
    title: "Powerful Tooling",
    description: (
      <>
        <p>
          Manage your intl workflow with the Lingui <a href="/ref/cli">CLI</a>,{" "}
          <a href="/ref/vite-plugin">Vite plugin</a>, and <a href="/ref/eslint-plugin">ESLint plugin</a>.
        </p>
        <p>
          The CLI extracts, compiles and validates messages, while the Vite plugin compiles catalogs on the fly, and the
          ESLint plugin helps catch common usage errors.
        </p>
      </>
    ),
    image: "tooling.png",
  },
  {
    title: "Full Rich-Text Support",
    description: (
      <p>
        Seamlessly use React components within localized messages, without any restrictions. Creating rich-text messages
        feels just like writing JSX.
      </p>
    ),
    image: "rich-text.svg",
  },
  {
    title: "AI Translations Ready",
    description: (
      <>
        <p>
          For AI to do great translations for you, context is critical. Translating UI copy is difficult because
          it&apos;s usually a list of short strings without enough context.
        </p>
        <p>
          Lingui&apos;s localization formats allow developers to write descriptions of where and how their keys are
          used.
        </p>
      </>
    ),
    image: "ai-ready.png",
  },
  {
    title: "Headache-Free Professional Localization",
    description: (
      <>
        <div className="mb-2">
          <code>Candidate knows 1 language</code>, but{" "}
          <code>
            Candidate knows 10 language<strong>s</strong>
          </code>
          .
        </div>
        <p>
          No need to know how many plurals the language has. Create a product in one language and deliver a perfect
          translation to users. Lingui follows Unicode ICU standards to handle plurals, genders and selects.
        </p>
      </>
    ),
    image: "clean-and-readable.png",
    className: "md:col-span-2",
  },
  {
    title: "Battle-Proven & Future Proof",
    description: (
      <>
        <p>
          Over the past few years, we have seen a lot of localization projects and developed a tool to handle them all.
        </p>
        <p>
          If your team needs to edit source texts without developer involvement, or you want the ability to deliver the
          most recent translations directly to your customers – we&apos;ve got you covered.
        </p>
      </>
    ),
    image: "time.svg",
    className: "md:col-span-2",
  },
  {
    title: "Suitable for All Localization Platforms",
    description: (
      <>
        <p>Integrate Lingui with your existing workflow. It supports both explicit and auto-generated message keys.</p>
        <p>
          Translations are stored in a standard PO file, which is supported by almost all translation tools. You can
          also use JSON, CSV, or create your own formatter.
        </p>
      </>
    ),
    image: "all-platforms.svg",
  },
  {
    title: "Verified by Thousands of Developers",
    description: (
      <p>
        Lingui has been used and tested by thousands of satisfied developers and has been proven to provide accurate and
        efficient i18n and l10n results. Join the community.
      </p>
    ),
    image: "verified.svg",
  },
  {
    title: "Fully Fledged",
    description: (
      <>
        <p>
          Lingui is a general-purpose framework with bindings for React (including RSC). It can be used on a server with
          Node.js or in Vanilla JavaScript.
        </p>
        <p>
          Extend its functionality with optional modules for features like lazy loading of language packs, automatic
          user locale detection, and more.
        </p>
      </>
    ),
    image: "fledged.svg",
    className: "md:col-span-2",
  },
];

const FeatureCard = ({ title, description, image, className }: FeatureDetails): React.ReactElement => (
  <div
    className={cx(
      "relative mb-6 grid min-w-0 grid-rows-[64px_1fr] rounded-xl border border-secondary/25 bg-white/10 p-6 backdrop-blur-md transition-colors",
      "hover:border-secondary/27 hover:bg-gray-100/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/14 dark:hover:bg-white/[0.07]",
      className
    )}
  >
    <img
      loading="lazy"
      decoding="async"
      src={image}
      width={64}
      height={64}
      alt=""
      className="h-16 w-16 select-none self-start"
    />
    <div className="mt-4 min-w-0">
      <h3 className="mb-3 text-xl font-medium tracking-tight text-heading">{title}</h3>
      <div className="text-base leading-relaxed text-body-fg [&_p]:m-0 [&_p+p]:mt-3 [&_a]:text-link [&_a]:no-underline [&_a]:underline-offset-2 [&_a:hover]:underline [&_code]:rounded-md [&_code]:bg-secondary/15 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.875em]">
        {description}
      </div>
    </div>
  </div>
);

export function Features(): React.ReactElement {
  const { withBaseUrl } = useBaseUrlUtils();

  const cards = (slice: FeatureDetails[]) =>
    slice.map((feature) => (
      <FeatureCard
        key={feature.title}
        image={withBaseUrl(`/img/features/${feature.image}`)}
        title={feature.title}
        description={feature.description}
        className={feature.className}
      />
    ));

  return (
    <section className="overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mx-auto mb-12 max-w-3xl text-center text-3xl font-medium tracking-tight text-heading sm:text-4xl">
          Why Choose Lingui for Your Localization Projects?
        </h2>

        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards(FEATURES.slice(0, 4))}
          <div className="relative col-span-full row-start-2 h-0 -z-10 hidden md:block">
            <img
              src="./img/features/pattern-left-big.svg"
              width="900"
              height="680"
              alt="Features Background"
              className="absolute -bottom-16 -left-36 select-none"
            />
          </div>
          {cards(FEATURES.slice(4, 6))}
          <div className="relative col-span-full row-start-4 z-0 h-0 hidden md:block">
            <img
              src="./img/features/pattern-right-big.svg"
              width="900"
              height="680"
              alt="Features Background"
              className="absolute -right-36 -top-16 select-none"
            />
          </div>
          {cards(FEATURES.slice(6))}
        </div>
      </div>

      <div className="text-center">
        <Button href={withBaseUrl("/introduction#key-features")} isOutline={true}>
          More Features
        </Button>
      </div>
    </section>
  );
}
