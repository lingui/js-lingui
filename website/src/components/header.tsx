import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { Button } from "./ui/button";

export function Header(): React.ReactElement {
  const { siteConfig = { url: "", title: "", tagline: "" } } = useDocusaurusContext();

  return (
    <header className="relative px-4 text-center sm:px-8">
      <div className="relative bottom-0 flex overflow-hidden rounded-b-3xl bg-gradient-to-b from-transparent to-red-500/5 p-0">
        <img
          src="/img/header/left-bg.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute left-0 top-0 z-0 h-full w-auto max-w-xl object-contain object-left-top opacity-50 lg:opacity-100"
        />
        <img
          src="/img/header/right-bg.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute right-0 top-0 z-0 h-full w-auto max-w-xl object-contain object-right-top opacity-50 lg:opacity-100"
        />

        <div className="relative z-10 mx-auto max-w-3xl px-8 py-16 backdrop-blur-md lg:backdrop-blur-none">
          <img
            width={128}
            height={128}
            className="mx-auto my-6 block max-h-44 max-w-44"
            src={"./img/lingui-logo.svg"}
            alt="Lingui"
          />
          <h1 className="mb-4 text-3xl font-bold sm:text-5xl">{siteConfig.tagline}</h1>
          <p className="mb-8 text-balance text-base leading-relaxed text-body-fg">
            Lingui is a lightweight, open-source internationalization (i18n) library for JavaScript and TypeScript. It
            brings compile-time macros and a CLI for message extraction to React, React Native, Vue, SolidJS, Astro,
            Svelte, and Node.js.
          </p>

          <div className="my-6 flex flex-wrap items-center justify-center gap-4">
            <Button href={useBaseUrl("/introduction")}>Get Started</Button>
            <Button href={useBaseUrl("/examples")} isOutline={true}>
              Examples
            </Button>
          </div>
          <iframe
            src={"https://ghbtns.com/github-btn.html?user=lingui&repo=js-lingui&type=star&count=true&size=large"}
            width={160}
            height={30}
            className="mt-6"
            title="GitHub Stars counter"
          />
        </div>
      </div>
    </header>
  );
}
