import React from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { Features } from "../components/features";
import { Header } from "../components/header";
import { Users } from "../components/users";
import { CallToAction } from "../components/call-to-action";
import { Code } from "../components/code";
import { PartnerBanner } from "../components/partner-banner";
import { LinguiWorkflow } from "../components/lingui-workflow";
import { SiteFooter } from "../components/site-footer";

function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.tagline}>
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
