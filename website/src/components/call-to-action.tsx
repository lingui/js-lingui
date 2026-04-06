import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Button } from "./ui/button";

export function CallToAction(): React.ReactElement {
  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="mb-3 text-2xl font-medium tracking-tight text-heading sm:text-3xl">
          Ready to localize your app?
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-body-fg">
          Start with the docs, automate message extraction, and deliver translations with tools that fit your existing
          stack.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button href={useBaseUrl("/introduction")}>View Docs</Button>
        </div>
      </div>
    </section>
  );
}
