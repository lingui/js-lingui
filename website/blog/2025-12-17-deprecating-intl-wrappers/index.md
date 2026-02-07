---
title: Saying goodbye to Lingui's Intl wrappers
authors: [yslpn]
tags: [deprecation, intl, api]
image: ./social-card.jpg
description: Why we are deprecating i18n.date/number and asking everyone to use native Intl APIs
---

We are deprecating Lingui wrappers around `Intl` (`i18n.date`, `i18n.number` and the shared helpers) and recommending direct use of native `Intl.*`. This follows [issue #2265](https://github.com/lingui/js-lingui/issues/2265) and [PR #2386](https://github.com/lingui/js-lingui/pull/2386).

![Social preview](./social-card.jpg)

<!--truncate-->

## Background

Initially, Lingui aimed to be a Swiss Army knife for localization, trying to take on as much as possible: from DX to performance optimization. We strived to create convenient formatting wrappers with built-in memoization, normalization, and so on. Now we have functions like `i18n.date` and `i18n.number`. But this prevents us from moving forward, and we need to abandon them.

## Problems

Creating such wrappers around native APIs leads to the following problems:

This is additional code that needs to be supported and maintained. The library does too much. We need to do less, but do it well. Lingui JS should focus on message extraction and working with catalogs. Formatting dates, numbers, and so on is the job of the `Intl` API.

These wrappers increase bundle size. Not all users use them. For example, there may be applications where date formatting doesn't depend on locale and is configured manually by the user. Tree-shaking doesn't work here because these are class methods.

We can't create wrappers for all Intl methods—there are too many of them https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl. This leads to poor DX when it's unclear what's in the library and what's not. This is exactly what prompted me to create an issue when I couldn't find how to use Intl.NumberFormat in Lingui.

## Plan

In a minor release, we're publishing a blog post, updating documentation, and adding deprecated warnings for methods via JSDoc comments.

In one of the major releases, we will remove the methods, but before that, we'll give enough time for users to prepare their code.

## Migrating to native Intl

The migration principle is simple: we need to replace the use of `i18n.date` and `i18n.number` methods with direct use of `Intl.DateTimeFormat` and `Intl.NumberFormat` respectively.

- `i18n.date(date, options)` => `new Intl.DateTimeFormat(i18n.locale, options).format(date);`
- `i18n.number(n, options)` => `new Intl.NumberFormat(i18n.locale, options).format(n);`

Example without React:

```ts
import type { I18n } from "@lingui/core";

const dateOptions = { dateStyle: "medium" } as const;
const currencyOptions = {
  style: "currency",
  currency: "EUR",
} as const;

export function formatOrderSummary(i18n: I18n, date: Date, total: number) {
  const dateFormatter = new Intl.DateTimeFormat(i18n.locale, dateOptions);
  const numberFormatter = new Intl.NumberFormat(i18n.locale, currencyOptions);

  // "Jan 18, 2026 - €1,234.56"
  return `${dateFormatter.format(date)} - ${numberFormatter.format(total)}`;
}
```

In React you have to use `useMemo` to memoize formatters and react to locale changes:

```tsx
import { useLingui } from "@lingui/react";
import { useMemo } from "react";

const dateOptions = { dateStyle: "medium" } as const;
const priceOptions = {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
} as const;

function PriceLine({ date, total }: { date: Date; total: number }) {
  const { i18n } = useLingui();

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.locale, dateOptions),
    [i18n.locale]
  );
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(i18n.locale, priceOptions),
    [i18n.locale]
  );

  return (
    <span>
      {/* "Jan 18, 2026 - $1,234.56" */}
      {dateFormatter.format(date)} - {numberFormatter.format(total)}
    </span>
  );
}
```

We are asking the community to contribute a codemod to help automate the migration. If you have experience writing codemods or want to try your hand at it, pull requests are welcome at https://github.com/lingui/js-lingui/pulls.
