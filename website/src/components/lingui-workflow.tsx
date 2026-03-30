import React from "react";
import type { ReactNode } from "react";
import { Terminal, FileText, Languages, FileCode, Server } from "lucide-react";
import CodeBlock from "@theme/CodeBlock";

interface CodeSnippet {
  code: string;
  language: string;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  iconBgColor: string;
  codeSnippet?: CodeSnippet;
  codePosition?: "left" | "right";
}

const defaultSteps: WorkflowStep[] = [
  {
    id: "define",
    title: "Define Messages",
    description: "Write messages directly in your codebase using Lingui's components.",
    icon: <Terminal className="h-8 w-8 text-slate-900" />,
    iconBgColor: "bg-cyan-400",
    codeSnippet: {
      language: "jsx",
      code: `<p>
  <Trans>Hello {name}!</Trans>
</p>`,
    },
    codePosition: "right",
  },
  {
    id: "extract",
    title: "Extract",
    description:
      "Use the Lingui CLI to extract all translation keys from your codebase and create or update message catalogs.",
    icon: <FileText className="h-8 w-8 text-slate-600" />,
    iconBgColor: "bg-slate-100",
    codeSnippet: {
      language: "gettext",
      code: `#: src/App.tsx:24
msgid "Hello {name}!"
msgstr "Hello {name}!"`,
    },
    codePosition: "left",
  },
  {
    id: "translate",
    title: "Translate",
    description: "Translate your message catalogs either manually or through integration with translation tools.",
    icon: <Languages className="h-8 w-8 text-violet-600" />,
    iconBgColor: "bg-slate-100",
    codeSnippet: {
      language: "gettext",
      code: `#: src/App.tsx:24
msgid "Hello {name}!"
msgstr "Ahoj {name}!"`,
    },
    codePosition: "right",
  },
  {
    id: "compile",
    title: "Compile",
    description:
      "Use the Lingui CLI to compile your message catalogs into a format that can be used in your application.",
    icon: <FileCode className="h-8 w-8 text-amber-600" />,
    iconBgColor: "bg-rose-100",
    codeSnippet: {
      language: "javascript",
      code: `module.exports = { 
  messages: JSON.parse("...") 
};`,
    },
    codePosition: "left",
  },
  {
    id: "deploy",
    title: "Deploy",
    description: "Include the compiled message catalogs in your production build.",
    icon: <Server className="h-8 w-8 text-cyan-600" />,
    iconBgColor: "bg-cyan-100",
  },
];

function WorkflowCodeBlock({ snippet }: { snippet: CodeSnippet }) {
  return (
    <div className="w-full max-w-sm">
      <CodeBlock className={`language-${snippet.language}`}>{snippet.code}</CodeBlock>
    </div>
  );
}

function StepIcon({ icon, bgColor, showLine = true }: { icon: ReactNode; bgColor: string; showLine?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`${bgColor} flex size-16 shrink-0 items-center justify-center rounded-xl shadow-md [&_svg]:block`}
      >
        {icon}
      </div>
      {showLine && <div className="w-0.5 h-18 md:h-24 bg-gradient-to-b from-cyan-400 to-cyan-400/30 mt-4" />}
    </div>
  );
}

function ServerIcon() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="w-24 h-8 bg-cyan-300 rounded-md flex items-center justify-center gap-1">
          <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full" />
          <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full" />
          <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full" />
        </div>
      ))}
    </div>
  );
}

interface LinguiWorkflowProps {
  steps?: WorkflowStep[];
}

export function LinguiWorkflow({ steps = defaultSteps }: LinguiWorkflowProps) {
  return (
    <section className="px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-medium tracking-tight text-heading sm:text-3xl">
            How Lingui fits your workflow
          </h2>
        </div>

        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Mobile Layout */}
            <div className="md:hidden flex flex-col items-center mb-8">
              <div className="text-center mb-6">
                <h3 className="mb-2 text-2xl font-medium tracking-tight text-heading">{step.title}</h3>
                <p className="mx-auto max-w-xs text-base leading-relaxed text-body-fg">{step.description}</p>
              </div>

              {step.id === "deploy" ? (
                <div className="mb-6">
                  <ServerIcon />
                </div>
              ) : (
                <StepIcon icon={step.icon} bgColor={step.iconBgColor} showLine={index < steps.length - 1} />
              )}

              {step.codeSnippet && (
                <div className="mt-6 w-full flex justify-center">
                  <WorkflowCodeBlock snippet={step.codeSnippet} />
                </div>
              )}

              {index < steps.length - 1 && step.id !== "deploy" && (
                <div className="w-0.5 h-8 bg-gradient-to-b from-cyan-400/30 to-transparent mt-4" />
              )}
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:grid md:grid-cols-3 md:gap-1 md:items-start mb-12">
              {/* Left Column */}
              <div className="flex justify-end">
                {step.codePosition === "left" && step.codeSnippet && <WorkflowCodeBlock snippet={step.codeSnippet} />}
                {step.codePosition === "right" && (
                  <div className="text-right">
                    <h3 className="mb-3 text-3xl font-medium tracking-tight text-heading">{step.title}</h3>
                    <p className="ml-auto max-w-xs text-base leading-relaxed text-body-fg">{step.description}</p>
                  </div>
                )}
              </div>

              {/* Center Column - Icon */}
              <div className="flex justify-center">
                {step.id === "deploy" ? (
                  <ServerIcon />
                ) : (
                  <StepIcon icon={step.icon} bgColor={step.iconBgColor} showLine={index < steps.length - 1} />
                )}
              </div>

              {/* Right Column */}
              <div className="flex justify-start">
                {step.codePosition === "right" && step.codeSnippet && <WorkflowCodeBlock snippet={step.codeSnippet} />}
                {step.codePosition === "left" && (
                  <div className="text-left">
                    <h3 className="mb-3 text-3xl font-medium tracking-tight text-heading">{step.title}</h3>
                    <p className="max-w-xs text-base leading-relaxed text-body-fg">{step.description}</p>
                  </div>
                )}
                {!step.codeSnippet && step.codePosition !== "left" && (
                  <div className="text-left">
                    <h3 className="mb-3 text-3xl font-medium tracking-tight text-heading">{step.title}</h3>
                    <p className="max-w-xs text-base leading-relaxed text-body-fg">{step.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
