---
title: Typed Message IDs
description: Learn how to opt in to type-safe message IDs for autocomplete and compile-time validation
---

# Typed Message IDs

Lingui supports opt-in typed message IDs via TypeScript module augmentation. When enabled, all functions and components that accept a message `id` (i.e. `i18n._()`, `i18n.t()`, and `<Trans>`) will be narrowed to your specific set of known IDs, giving you autocomplete and compile-time errors for invalid IDs.

Without augmentation, `id` remains `string` and existing behavior is unchanged.

## Setup

Create a declaration file that augments the `Register` interface from `@lingui/core`:

```ts title="src/lingui.d.ts"
import type enMessages from "./locales/en/messages.json";

declare module "@lingui/core" {
  interface Register {
    messageIds: keyof typeof enMessages;
  }
}
```

The `messageIds` key must resolve to a union of string literal types. When `Register` is augmented with `messageIds`, the `MessageId` type resolves to that union. When `Register` is empty (the default), `MessageId` falls back to `string`.

## Usage

Once set up, TypeScript will flag invalid IDs:

```tsx
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react";

// ✅ Valid — "welcome.title" exists in your catalog
const msg = t({ id: "welcome.title", message: "Welcome!" });

// ❌ Type error — "welcme.title" is not a known message ID
const bad = t({ id: "welcme.title", message: "Welcome!" });

// ✅ Autocomplete works in JSX too
<Trans id="welcome.title">Welcome!</Trans>;
```

## Notes

- This feature is **fully opt-in**. Without the `.d.ts` augmentation, all existing code continues to work with `string` IDs.
- There is **no runtime impact**. The `Register` interface and `MessageId` type are erased at compile time.
- You can point `messageIds` at any source that produces a string union, such as a compiled catalog JSON import, a hand-maintained union type, or a generated `.d.ts` file.
