import React, { useState } from "react";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import clsx from "clsx";
import { Button } from "./ui/button";

interface CodeSample {
  id: string;
  title: string;
  description: React.ReactNode;
  code: string;
  language: string;
}

const codeSamples: CodeSample[] = [
  {
    id: "basic",
    title: "Basic Usage",
    description: (
      <>
        Use the <code>Trans</code> component to wrap translatable content.
      </>
    ),
    language: "jsx",
    code: `import { Trans } from "@lingui/react/macro"

function App() {
  return (
    <Trans
      comment="Docs link on the website"
    >
      Read the <a href="https://lingui.dev">documentation</a>
      for more info.
    </Trans>
  )
}`,
  },
  {
    id: "plurals",
    title: "Plurals",
    description: (
      <>
        Handle plural forms automatically based on <code>count</code>. Lingui supports all CLDR plural categories
        through <code>Plural</code>.
      </>
    ),
    language: "jsx",
    code: `import { Plural } from "@lingui/react/macro"

function Messages({ count }) {
  return (
    <Plural
      value={count}
      one="You have # new message"
      other="You have # new messages"
      zero="You have no messages"
    />
  )
}`,
  },
  {
    id: "select",
    title: "Select",
    description: (
      <>
        Choose between different translations based on a value with <code>Select</code>, perfect for gender or status
        variations.
      </>
    ),
    language: "jsx",
    code: `import { Select } from "@lingui/react/macro"

function Greeting({ gender, name }) {
  return (
    <Select
      value={gender}
      _male={<>Welcome back, Mr. {name}!</>}
      _female={<>Welcome back, Ms. {name}!</>}
      other={<>Welcome back, {name}!</>}
    />
  )
}`,
  },
  {
    id: "non-react",
    title: "JavaScript",
    description: (
      <>
        Use <code>t</code> for immediate translations and <code>msg</code> for deferred message descriptors in vanilla
        JavaScript or Node.js projects.
      </>
    ),
    language: "javascript",
    code: `import { t, msg } from "@lingui/core/macro"
import { i18n } from "@lingui/core"

function notifyUser(userName) {
  const greeting = t\`Hello, \${userName}!\`
  const welcome = msg\`Welcome to our app\`

  console.log(greeting)
  console.log(i18n._(welcome))
}

notifyUser("Sam")`,
  },
  {
    id: "variables",
    title: "Variables",
    description: (
      <>
        Interpolate dynamic values into translations and use <code>ph</code> to add explicit placeholder labels for
        translators and extraction.
      </>
    ),
    language: "tsx",
    code: `import { ph } from "@lingui/core/macro"
import { useLingui } from "@lingui/react/macro"

function UserGreeting({ user }) {
  const { t } = useLingui()
  const userName = ph({ name: user.name })
  const projectName = ph({ name: "Lingui" })

  return (
    <p>{t\`Hello, \${userName}! Welcome to \${projectName}.\`}</p>
  )
}`,
  },
];

export function Code(): React.ReactElement {
  const { withBaseUrl } = useBaseUrlUtils();
  const [activeTab, setActiveTab] = useState("basic");
  const activeSample = codeSamples.find((sample) => sample.id === activeTab);

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-heading mb-12 text-center text-3xl font-medium tracking-tight sm:text-4xl">
          Integrating Lingui into Your Project is Easy!
        </h2>

        <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {codeSamples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => setActiveTab(sample.id)}
                aria-pressed={activeTab === sample.id}
                className={clsx(
                  "rounded-xl border p-3 text-left transition",
                  activeTab === sample.id
                    ? "border-primary bg-primary/10"
                    : "border-secondary/25 bg-white/10 hover:border-secondary/35 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/14"
                )}
              >
                <span className="block text-sm font-semibold">{sample.title}</span>
              </button>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            {activeSample && (
              <div>
                <div
                  className="overflow-hidden rounded-xl border border-secondary/25 bg-white/10 dark:border-white/10 dark:bg-white/5 [&_.theme-code-block]:mb-0"
                  key={activeSample.id}
                >
                  <CodeBlock className={`language-${activeSample.language}`}>{activeSample.code.trim()}</CodeBlock>
                  <div className="border-t border-secondary/25 px-4 py-3 text-sm leading-relaxed text-body-fg dark:border-white/10 [&_code]:rounded-md [&_code]:bg-secondary/15 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.875em]">
                    {activeSample.description}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center">
          <Button href={withBaseUrl("/ref/macro")} isOutline={true}>
            Macros Reference
          </Button>
        </p>
      </div>
    </section>
  );
}
