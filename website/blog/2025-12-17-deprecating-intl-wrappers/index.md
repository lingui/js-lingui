---
title: Saying goodbye to Lingui's Intl wrappers
authors: [yslpn]
tags: [deprecation, intl, api]
image: ./social-card.jpg
description: Why we are deprecating i18n.date/time/number and asking everyone to use native Intl APIs
---

We are deprecating Lingui wrappers around `Intl` (`i18n.date`, `i18n.time`, `i18n.number` and the shared helpers) and recommending direct use of native `Intl.*`. This follows [issue #2265](https://github.com/lingui/js-lingui/issues/2265) and [PR #2386](https://github.com/lingui/js-lingui/pull/2386).

![Social preview](./social-card.jpg)

<!--truncate-->

## Why we are leaving the wrappers

- Coverage gap. `@lingui/core` wraps only `Intl.DateTimeFormat` and `Intl.NumberFormat`, but users expect parity for `Intl.ListFormat`, `Intl.RelativeTimeFormat`, `Intl.DisplayNames`, `Intl.Collator`, `Intl.Segmenter`, and more. Chasing the full [MDN Intl surface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) adds work without unique value.
- Maintenance and bundle weight. Every wrapper needs types, tests, caching, and examples. Native `Intl` is stable and cross platform already; extra code in Lingui is not buying us much.
- Expectation creep. If we ship React hooks on top of these wrappers, people will want the same helpers outside React, which brings us back to maintaining a copy of every `Intl` method.
- Special cases already covered. We do not need an `Intl.PluralRules` wrapper because plural selection lives inside the messageformat compiler (`@lingui/message-utils`). Exposing another public API only confuses the story.

## What full wrapper parity would require

To meet the expectations for a complete helper surface we would need wrappers and caching at least for `DateTimeFormat`, `NumberFormat`, `ListFormat`, `RelativeTimeFormat`, `DisplayNames`, `Collator`, `Segmenter`, `Locale`, `DurationFormat` (once it ships), plus `formatRange` and `formatToParts`. We are intentionally not going to maintain this matrix.

## Plan

- Now: mark the helpers as deprecated in code and docs without breaking existing apps.
- Upcoming majors: keep them long enough to give teams time to migrate; removal will happen in one of the next majors (not necessarily the very next one).
- Removal: no separate warning blog is planned - please track the release notes for major versions.

## Migrating to native Intl

Pick the same locale precedence (`i18n.locales ?? i18n.locale`) and build your own formatters. Define helpers that read the current locale every time, so locale switches stay in sync:

```ts
import { i18n } from "@lingui/core";

function getDateFormatter(options?: Intl.DateTimeFormatOptions) {
  const locales = i18n.locales ?? i18n.locale;
  return new Intl.DateTimeFormat(locales, options);
}

function getNumberFormatter(options?: Intl.NumberFormatOptions) {
  const locales = i18n.locales ?? i18n.locale;
  return new Intl.NumberFormat(locales, options);
}

export function formatOrderSummary(date: Date, total: number) {
  const dateFormatter = getDateFormatter({ dateStyle: "medium" });
  const numberFormatter = getNumberFormatter({
    style: "currency",
    currency: "EUR",
  });

  return `${dateFormatter.format(date)} - ${numberFormatter.format(total)}`;
  // => "Jan 18, 2026 - €1,234.56"
}
```

In React you can create small reusable hooks that memoize formatters, accept formatting options, and still react to locale changes:

```tsx
import { useLingui } from "@lingui/react";
import { useMemo } from "react";

function useDateFormatter(options?: Intl.DateTimeFormatOptions) {
  const { i18n } = useLingui();

  return useMemo(() => {
    const locales = i18n.locales ?? i18n.locale;
    return new Intl.DateTimeFormat(locales, options);
  }, [i18n.locales, i18n.locale, options]);
}

function useNumberFormatter(options?: Intl.NumberFormatOptions) {
  const { i18n } = useLingui();

  return useMemo(() => {
    const locales = i18n.locales ?? i18n.locale;
    return new Intl.NumberFormat(locales, options);
  }, [i18n.locales, i18n.locale, options]);
}

function PriceLine({ date, total }: { date: Date; total: number }) {
  const dateOptions = useMemo(() => ({ dateStyle: "medium" }), []);
  const numberOptions = useMemo(
    () => ({
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }),
    []
  );

  const dateFormatter = useDateFormatter(dateOptions);
  const numberFormatter = useNumberFormatter(numberOptions);
  // Renders: <span>Jan 18, 2026 - $1,234.56</span>
  return (
    <span>
      {dateFormatter.format(date)} - {numberFormatter.format(total)}
    </span>
  );
}
```

## What about React hooks

We do not plan to add `useDateFormat` or `useNumberFormat`. Shipping hooks on top of the wrappers would trigger requests for the same helpers outside React and across frameworks, putting us back into the role of wrapping all of `Intl`. Teams can keep local hooks or shared formatters without Lingui adapters.

## FAQ

- **What about performance?** Creating `Intl.*Format` is inexpensive, and you can keep formatters at module scope or memoize them. No special internal cache from Lingui is required.
- **What about `PluralRules`?** Lingui already uses it inside message compilation, so another public formatter is unnecessary.
- **When will removal happen?** Deprecated APIs will remain for now; removal will land in one of the upcoming majors (not necessarily the very next).
