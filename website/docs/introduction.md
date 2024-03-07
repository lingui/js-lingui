---
title: Internationalization Framework for Global Products
description: Lingui is a universal, clean and readable, lightweight and powerful internationalization framework for global projects
---

📖 A readable, automated, and optimized (3 kb) internationalization for JavaScript

> **Internationalization** is the design and development of a product, application or document content that enables easy **localization** for target audiences that vary in culture, region, or language.
>
> — [W3C Web Internationalization FAQ](https://www.w3.org/International/questions/qa-i18n)

[![GitHub stars](https://img.shields.io/github/stars/lingui/js-lingui.svg?style=social&label=Stars)](https://github.com/lingui/js-lingui/)

## Key features

Lingui is an easy yet powerful internationalization framework for global projects.

### Clean and readable

Keep your code clean and readable, while the library uses battle-tested and powerful **ICU MessageFormat** under the hood.

### Universal

Use it everywhere. [`@lingui/core`](/docs/ref/core.md) provides the essential intl functionality which works in any JavaScript project while [`@lingui/react`](/docs/ref/react.md) offers components to leverage React rendering.

### Full rich-text support

Use React components inside localized messages without any limitation. Writing rich-text messages is as easy as writing JSX.

### AI Translations Ready

For AI to do great translations for you, context is critical. Translating UI copy is difficult because it's usually a list of short strings without enough context. Lingui's localization formats allow developers to write descriptions of where and how your keys are used. This allows both human translators and AI to make better translations.

### Powerful tooling

Manage the whole intl workflow using Lingui [CLI](/docs/ref/cli.md). It extracts messages from source code, validates messages coming from translators and checks that all messages are translated before shipping to production.

### Unopinionated

Integrate Lingui into your existing workflow. It supports explicit message keys as well as auto-generated ones. Translations are stored either in JSON or standard PO file, which is supported in almost all translation tools.

### Lightweight and optimized

Core library is only [1.5 kB gzipped](https://bundlephobia.com/result?p=@lingui/core), React components are additional [1.3 kB gzipped](https://bundlephobia.com/result?p=@lingui/react). That's less than Redux for a full-featured intl library.

### Active community

Join us on [GitHub Discussions](https://github.com/lingui/js-lingui/discussions) to discuss the latest development or ask questions.

### Compatible with react-intl

Low-level React API is very similar to react-intl and the message format is the same. It's easy to migrate an existing project.

## Quick overview

```jsx
import React from "react";
import { t, Trans, Plural } from "@lingui/macro";

export default function Lingui({ numUsers, name = "You" }) {
  return (
    <div>
      <h1>
        {/* Localized messages are simply wrapped in <Trans> */}
        <Trans id="msg.header">Internationalization in React</Trans>
      </h1>

      {/* Element attributes are translated using t macro */}
      <img src="./logo.png" alt={t`Logo of Lingui Project`} />

      <p className="lead">
        {/* Variables are passed to messages in the same way as in JSX */}
        <Trans id="msg.lead">
          Hello {name}, LinguiJS is a readable, automated, and optimized (3 kb) internationalization for JavaScript.
        </Trans>
      </p>

      {/* React Elements inside messages works in the same way as in JSX */}
      <p>
        <Trans id="msg.docs">
          Read the <a href="https://lingui.dev">documentation</a>
          for more info.
        </Trans>
      </p>

      {/*
        Plurals are managed using ICU plural rules.
        Content of one/other slots is localized using <Trans>.
        Nesting of i18n components is allowed.
        Syntactically valid message in ICU MessageFormat is guaranteed.
      */}
      <Plural
        id="msg.plurals"
        value={numUsers}
        one={
          <span>
            Only <strong>one</strong> user is using this library!
          </span>
        }
        other={
          <span>
            <strong>{numUsers}</strong> users are using this library!
          </span>
        }
      />
    </div>
  );
}
```
