import React from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Features from "../components/Features";
import Header from "../components/Header";
import Users from "../components/Users";
import Code from "../components/Code";

function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.tagline}>
      <Header />
      <main className={"main-page-content"}>
        <Features />
        <Code />
        <Users />
      </main>
    </Layout>
  );
}

export default Home;
