---
title: i18n with AI
description: Give AI coding agents accurate, up-to-date Lingui knowledge with Agent Skills, llms.txt context files, and the Context7 MCP server
---

AI coding agents and chat tools have become an essential part of the development workflow, and internationalization is no exception. However, most AI models have limited or outdated knowledge of Lingui's APIs and best practices. This page covers the resources available to give your AI tools accurate, up-to-date Lingui knowledge so they can help you ship localized products faster.

## Agent Skills

[Lingui Agent Skills](https://github.com/lingui/skills) are reusable, procedural knowledge packages for AI coding agents. They provide best practices, common patterns, and troubleshooting guides that agents can follow when working with Lingui - reducing hallucinations and incorrect API usage.

### Installation

The skills follow the [Agent Skills format](https://agentskills.io) and work with Claude Code, Cursor, Codex, Gemini CLI, GitHub Copilot, and other compatible agents. Use whichever installer matches your tool - each one installs the whole set.

**Skills CLI:**

```shell
npx skills add lingui/skills
```

**Claude Code plugin** - all skills load automatically and stay up to date via `/plugin marketplace update`:

```text
/plugin marketplace add lingui/skills
/plugin install lingui@lingui-skills
```

**Plugins CLI** - auto-detects your installed agent tools and installs through each one's native plugin system:

```shell
npx plugins add lingui/skills
```

**Gemini CLI extension:**

```shell
gemini extensions install https://github.com/lingui/skills
```

**GitHub CLI** (v2.90+) - installs for GitHub Copilot or any other supported agent. Use `--agent <name>` to target a specific tool, and `gh skill update` to pull newer versions:

```shell
gh skill install lingui/skills --all
```

To install a single skill instead of the full set, pass `--skill` to the Skills CLI:

```shell
npx skills add lingui/skills --skill lingui-best-practices
```

See the [Lingui Skills](https://github.com/lingui/skills) repository for more details about the available skills and their usage.

## Context Files

Lingui follows the [llms.txt specification](https://llmstxt.org/) and publishes two files optimized for AI consumption: [`llms.txt`](https://lingui.dev/llms.txt), an index of the documentation pages with a short summary of each, and [`llms-full.txt`](https://lingui.dev/llms-full.txt), the full docs content in a single streamlined Markdown file. Both are regenerated with every docs build, and some AI tools auto-discover them if you provide `https://lingui.dev` as a docs source.

While these files are easy to parse, `llms-full.txt` is large and uses a lot of tokens when loaded directly into context, and a copy saved into your repository goes stale over time. They are best used as a fallback when the AI tool cannot access the latest documentation in other ways. The [Context7 MCP server](#context7-mcp) searches the same documentation on demand and returns only the relevant parts, making it the preferred option when available.

:::tip
Every documentation page is also available as plain Markdown: append `.md` to its URL, for example [`https://lingui.dev/ref/macro.md`](https://lingui.dev/ref/macro.md) for the Macros reference. A single page costs a fraction of the tokens of `llms-full.txt`, so when you know which part of the docs the agent needs, give it that URL instead. The links in `llms.txt` already point to these Markdown versions.
:::

## Context7 MCP

[Context7](https://context7.com/lingui/js-lingui) is an MCP (Model Context Protocol) server that provides AI tools with real-time access to up-to-date library documentation - including Lingui. Unlike static context files, Context7 indexes the latest docs and lets agents search them on demand, keeping token usage low.

### Usage

Add `use context7` to any prompt and Context7-enabled agents will automatically pull relevant Lingui documentation:

```text
Add i18n to my React app using Lingui. use context7
```

### MCP Server Configuration

If your AI tool supports MCP server configuration, you can add Context7 directly:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

For tool-specific setup instructions (including remote server and other clients), visit the [Context7 page for Lingui](https://context7.com/lingui/js-lingui).
