import React from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { Features } from "../components/features";
import { Header } from "../components/header";
import { Users } from "../components/users";
import { CallToAction } from "../components/call-to-action";
import { Code } from "../components/code";
import { Faq } from "../components/faq";
import { PartnerBanner } from "../components/partner-banner";
import { LinguiWorkflow } from "../components/lingui-workflow";
import { SiteFooter } from "../components/site-footer";

const TITLE = "Lingui | Lightweight i18n Framework for React & JS";
const DESCRIPTION =
  "Lingui is a lightweight, open-source i18n library for JavaScript and TypeScript: compile-time macros and a CLI for React, React Native, Vue, SolidJS, Astro, Svelte and Node.js.";

function Home() {
  const { siteConfig } = useDocusaurusContext();
  const siteUrl = siteConfig.url.replace(/\/$/, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Lingui",
        url: siteUrl,
        logo: `${siteUrl}/img/logo-small.svg`,
        sameAs: [
          "https://github.com/lingui/js-lingui",
          "https://www.npmjs.com/package/@lingui/core",
          "https://x.com/LinguiJS",
          "https://discord.gg/hdNuF3rupQ",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Lingui",
        description: DESCRIPTION,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "SoftwareSourceCode",
        "@id": `${siteUrl}/#software`,
        name: "Lingui",
        description:
          "Lingui is a lightweight, open-source internationalization (i18n) library for JavaScript and TypeScript. It brings compile-time macros and a CLI for message extraction to React, React Native, Vue, SolidJS, Astro, Svelte, and Node.js.",
        url: siteUrl,
        codeRepository: "https://github.com/lingui/js-lingui",
        programmingLanguage: ["JavaScript", "TypeScript"],
        runtimePlatform: ["Node.js", "Web browser", "React Native"],
        license: "https://github.com/lingui/js-lingui/blob/main/LICENSE",
        keywords: "i18n, internationalization, localization, ICU MessageFormat, React, JavaScript, TypeScript",
        author: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <Layout>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <script type="application/ld+json">{JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>
      </Head>
      <main className="space-y-24">
        <Header />
        <PartnerBanner />
        <Features />
        <LinguiWorkflow />
        <Code />
        <Users />
        <Faq />
        <CallToAction />
        <SiteFooter />
      </main>
    </Layout>
  );
}

export default Home;
