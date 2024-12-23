import React from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Features from "../components/Features";
import Header from "../components/Header";
import Users from "../components/Users";
import Code from "../components/Code";
import PartnerBanner from "../components/PartnerBanner";
import Workflow from "../components/Workflow";

function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.tagline}>
      <Header />
      <main>
        <PartnerBanner />
        <Features />
        <Workflow />
        <Code />
        <Users />
      </main>
    </Layout>
  );
}

export default Home;
