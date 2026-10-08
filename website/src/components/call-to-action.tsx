import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Button } from "./ui/button";
import { Section } from "./ui/section";

export function CallToAction(): React.ReactElement {
  return (
    <Section
      title="Ready to localize your app?"
      intro="Start with the docs, automate message extraction, and deliver translations with tools that fit your existing stack."
    >
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button href={useBaseUrl("/introduction")}>View Docs</Button>
      </div>
    </Section>
  );
}
