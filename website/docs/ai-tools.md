---
title: i18n with AI
description: Resources and tips for internationalizing your application with AI assistance
---

AI coding agents and chat tools have become an essential part of the development workflow, and internationalization is no exception. However, most AI models have limited or outdated knowledge of Lingui's APIs and best practices. This page covers the resources available to give your AI tools accurate, up-to-date Lingui knowledge so they can help you ship localized products faster.

## Agent Skills

[Agent Skills](https://github.com/lingui/skills) are reusable, procedural knowledge packages for AI coding agents. They provide best practices, common patterns, and troubleshooting guides that agents can follow when working with Lingui - reducing hallucinations and incorrect API usage.

:::info
The Lingui skills library is in an early stage. The number of available skills will grow over time. Feedback and contributions are very welcome!
:::

### Installation

Install all Lingui skills with a single command:

```shell
npx skills add lingui/skills
```

See the [Lingui Skills](https://github.com/lingui/skills) repository for more details about the available skills and their usage.

## Context Files

Lingui provides [`llms.txt`](https://lingui.dev/llms.txt) and [`llms-full.txt`](https://lingui.dev/llms-full.txt) files that contain the full docs content in a format optimized for AI consumption. These are static files of the Lingui documentation in a streamlined Markdown format. Some AI tools can auto-discover these files if you provide `https://lingui.dev` as a docs source.

While these files provide a minimal, easy-to-parse version of the documentation, they are large files that will use a lot of tokens if used directly in context and will need to be updated regularly to stay current. They are best used as a fallback when the AI tool does not have access to the latest documentation in other ways. The Context7 MCP server provides more efficient access to the full documentation with real-time search capabilities, making it the preferred option when available.

Read more about the specification at [llmstxt.org](https://llmstxt.org/).

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
