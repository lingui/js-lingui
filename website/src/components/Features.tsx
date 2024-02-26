import React from "react";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";

import styles from "./Features.module.scss";
import Button from "./Button";
import clsx from "clsx";

interface FeatureDetails {
  title: string;
  description: JSX.Element;
  image: string;
  additionalClass: string;
}

const FEATURES: FeatureDetails[] = [
  {
    title: "Universal",
    description: (
      <p>
        Use it everywhere. <code>@lingui/core</code> provides the essential intl functionality which works in any
        JavaScript project, while <code>@lingui/react</code> offers components for leveraging React rendering.
      </p>
    ),
    image: "universal.svg",
    additionalClass: "",
  },
  {
    title: "Powerful Tooling",
    description: (
      <p>
        Manage the whole intl workflow using Lingui CLI. It extracts messages from source code, validates messages from
        translators and checks that all messages are translated before shipping to production.
      </p>
    ),
    image: "tooling.png",
    additionalClass: "",
  },
  {
    title: "Full Rich-Text Support",
    description: (
      <p>
        Use React components inside localized messages without any limitations. Writing rich-text messages is as easy as
        writing JSX.
      </p>
    ),
    image: "rich-text.svg",
    additionalClass: "",
  },
  {
    title: "AI Translations Ready",
    description: (
      <p>
        For AI to do great translations for you, context is critical. Translating UI copy is difficult because it&apos;s
        usually a list of short strings without enough context. Lingui&apos;s localization formats allow developers to
        write descriptions of where and how your keys are used.
      </p>
    ),
    image: "ai-ready.png",
    additionalClass: "",
  },
  {
    title: "Headache-Free Professional Localization",
    description: (
      <div>
        <div className={"margin-bottom--sm"}>
          <code>Candidate knows 1 language</code>, but{" "}
          <code>
            Candidate knows 10 language<strong>s</strong>
          </code>
          .
        </div>
        <p>
          You don&apos;t have to know how many plurals the language has. Create a product in one language, and deliver a
          perfect translation to users. Lingui follows Unicode ICU standards to handle plurals, genders, and selects.
        </p>
      </div>
    ),
    image: "clean-and-readable.png",
    additionalClass: styles.featureCardCellWide,
  },
  {
    title: "Battle-Proven & Future Proof",
    description: (
      <p>
        During the last 7 years, we&apos;ve seen a lot of localization projects and developed a tool to handle them all.
        <br />
        If your team needs to edit source texts without developer involvement, or you want the ability to deliver the
        most recent translations directly to your customers – we&apos;ve got you covered.
      </p>
    ),
    image: "time.svg",
    additionalClass: styles.featureCardCellWide,
  },
  {
    title: "Suitable for All Localization Platforms",
    description: (
      <p>
        Integrate Lingui into your existing workflow. It supports message keys as well as auto-generated messages.
        Translations are stored in JSON or standard PO file, which is supported in almost all translation tools.
      </p>
    ),
    image: "all-platforms.svg",
    additionalClass: "",
  },
  {
    title: "Verified by Thousands of People",
    description: (
      <p>
        Lingui has been used and tested by thousands of satisfied users and has been proven to provide accurate and
        efficient i18n and l10n results. Join the thousands of satisfied customers.
      </p>
    ),
    image: "verified.svg",
    additionalClass: "",
  },
  {
    title: "Fully Fledged",
    description: (
      <p>
        Lingui is a general-purpose framework with bindings for React. Use it on a server in Node.js or Vanilla
        JavaScript.
        <br />A set of optional modules would implement lazy loading of language packs, user locale detection, and more.
      </p>
    ),
    image: "fledged.svg",
    additionalClass: styles.featureCardCellWide,
  },
];

const FeatureCard = ({ title, description, image, additionalClass }: FeatureDetails): React.ReactElement => (
  <div className={clsx(styles.featureCard, additionalClass)}>
    <img loading="lazy" src={image} width="64px" height="64px" alt="Feature Logo" />
    <div className={styles.featureCardContent}>
      <h3>{title}</h3>
      <div>{description}</div>
    </div>
  </div>
);

const Features = (): React.ReactElement => {
  const { withBaseUrl } = useBaseUrlUtils();

  return (
    <section>
      <div className="container">
        <div className="row">
          <div className={"col col--8 col--offset-2"}>
            <h2 className={"text--center margin-bottom--lg"}>Why Choose Lingui for Your Localization Projects?</h2>
          </div>
          <div className="col col--offset-1 col--10">
            <div className={styles["features--wrap"]}>
              {FEATURES.slice(0, 4).map((feature: FeatureDetails, idx) => (
                <FeatureCard
                  key={idx}
                  image={withBaseUrl(`/img/features/${feature.image}`)}
                  title={feature.title}
                  description={feature.description}
                  additionalClass={feature.additionalClass}
                />
              ))}
              <div className={styles["features--left-img"]}>
                <img src={"./img/features/pattern-left-big.svg"} width="900" height="680" alt="Features Background" />
              </div>
              {FEATURES.slice(4, 6).map((feature: FeatureDetails, idx) => (
                <FeatureCard
                  key={idx}
                  image={withBaseUrl(`/img/features/${feature.image}`)}
                  title={feature.title}
                  description={feature.description}
                  additionalClass={feature.additionalClass}
                />
              ))}
              <div className={styles["features--right-img"]}>
                <img src={"./img/features/pattern-right-big.svg"} width="900" height="680" alt="Features Background" />
              </div>
              {FEATURES.slice(6).map((feature: FeatureDetails, idx) => (
                <FeatureCard
                  key={idx}
                  image={withBaseUrl(`/img/features/${feature.image}`)}
                  title={feature.title}
                  description={feature.description}
                  additionalClass={feature.additionalClass}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.linkFeatures}>
        <Button href={withBaseUrl("/introduction#key-features")} isOutline={true}>
          More Features
        </Button>
      </div>
    </section>
  );
};

export default Features;
