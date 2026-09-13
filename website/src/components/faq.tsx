import React from "react";

interface FaqItem {
  question: string;
  answer: JSX.Element;
}

const FAQ: FaqItem[] = [
  {
    question: "Does Lingui work with the Next.js App Router and React Server Components?",
    answer: (
      <p>
        Yes. <code>@lingui/react</code> supports React Server Components with both the SWC and the Babel setup of
        Next.js. See the <a href="/tutorials/react-rsc">React Server Components tutorial</a> for an App Router
        walkthrough and the{" "}
        <a href="https://github.com/lingui/js-lingui/tree/main/examples/nextjs-swc">Next.js example</a>, which covers
        both routers.
      </p>
    ),
  },
  {
    question: "How do I translate strings outside a React component, for example in constants or validation schemas?",
    answer: (
      <p>
        Tag the string with the <code>msg</code> macro to get a message descriptor you can define at module level and
        translate where it is rendered with <code>i18n.t()</code> or <code>_</code> from <code>useLingui</code>. The
        same pattern picks a message by a runtime value. See <a href="/guides/lazy-translations">Lazy Translations</a>{" "}
        and the <a href="/ref/macro#using-macros">macro usage notes</a>.
      </p>
    ),
  },
  {
    question: "Why do translations work in development but show message IDs in production?",
    answer: (
      <p>
        Development keeps the source messages and the message compiler in the bundle; production strips both and relies
        on compiled catalogs, so anything not extracted before the build renders as its ID. Run{" "}
        <code>lingui extract</code> and <code>lingui compile</code> before building. <code>@lingui/vite-plugin</code>,{" "}
        <code>@lingui/loader</code> and <code>@lingui/metro-transformer</code> can take over the compile step, but
        extraction still has to run. Details in <a href="/guides/optimizing-bundle-size">Keeping Your Bundle Small</a>.
      </p>
    ),
  },
  {
    question: "Can I use Lingui without React, for example in Node.js, Vue or Svelte?",
    answer: (
      <p>
        Yes. <code>@lingui/core</code> is framework-agnostic and works in the browser, on a Node.js server or in a
        script, and the core macros work in any JavaScript code. Vue files are handled by{" "}
        <code>@lingui/extractor-vue</code>; Svelte and Astro use community packages. Start with the{" "}
        <a href="/tutorials/javascript">JavaScript tutorial</a> or the <a href="/ref/extractor-vue">Vue extractor</a>.
      </p>
    ),
  },
  {
    question: "How do I load only the active language's catalog instead of bundling every locale?",
    answer: (
      <p>
        Compiled catalogs are ordinary modules: dynamically <code>import()</code> the one for the requested locale, then
        call <code>i18n.load()</code> and <code>i18n.activate()</code>. Bundlers emit one chunk per language and fetch
        only the active one. Load the source locale too, since production builds drop the default messages. See{" "}
        <a href="/guides/dynamic-loading-catalogs">Dynamic Loading of Message Catalogs</a>.
      </p>
    ),
  },
  {
    question: "Does Lingui work with React Native and Expo?",
    answer: (
      <p>
        Yes. React Native uses the same packages and extract-and-compile workflow as the web, and the optional{" "}
        <code>@lingui/metro-transformer</code> compiles <code>.po</code> files on the fly. Give{" "}
        <code>I18nProvider</code> a default component that renders <code>Text</code>, and polyfill{" "}
        <code>Intl.Locale</code> and <code>Intl.PluralRules</code> if your engine lacks them. See the{" "}
        <a href="/tutorials/react-native">React Native tutorial</a> and the{" "}
        <a href="https://github.com/lingui/js-lingui/tree/main/examples/react-native">Expo example</a>.
      </p>
    ),
  },
];

export function Faq(): React.ReactElement {
  return (
    <section className="px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-12 text-center text-3xl font-medium tracking-tight text-heading sm:text-4xl">
          Frequently asked questions
        </h2>
        <div className="divide-y divide-secondary/25 border-y border-secondary/25 dark:divide-white/10 dark:border-white/10">
          {FAQ.map(({ question, answer }) => (
            <details key={question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left [&::-webkit-details-marker]:hidden">
                <h3 className="m-0 text-lg font-medium tracking-tight text-heading">{question}</h3>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 shrink-0 text-body-fg motion-safe:transition-transform group-open:rotate-180"
                >
                  <path d="M5 8l5 5 5-5" />
                </svg>
              </summary>
              <div className="mt-3 pr-9 text-base leading-relaxed text-body-fg [&_p]:m-0 [&_a]:text-link [&_a]:no-underline [&_a]:underline-offset-2 [&_a:hover]:underline [&_code]:rounded-md [&_code]:bg-secondary/15 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.875em]">
                {answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
