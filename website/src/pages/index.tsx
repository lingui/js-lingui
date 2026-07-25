import React from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import { Features } from "../components/features";
import { Header } from "../components/header";
import { Users } from "../components/users";
import { CallToAction } from "../components/call-to-action";
import { Code } from "../components/code";
import { PartnerBanner } from "../components/partner-banner";
import { LinguiWorkflow } from "../components/lingui-workflow";
import { SiteFooter } from "../components/site-footer";

const TITLE = "Lingui | Lightweight i18n Framework for React & JS";
const DESCRIPTION =
  "Build global products with Lingui, the lightweight JavaScript i18n framework. Features full React and RSC support, JSX rich-text, and powerful CLI tooling.";

function Home() {
  return (
    <Layout>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
      </Head>
      <main className="space-y-24">
        <Header />
        <PartnerBanner />
        <Features />
        <LinguiWorkflow />
        <Code />
        <Users />
        <CallToAction />
        <SiteFooter />
      </main>
    </Layout>
  );
}

export default Home;
