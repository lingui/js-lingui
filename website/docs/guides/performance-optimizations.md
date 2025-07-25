# Keeping Your Bundle Small: How Lingui Optimizes for Performance

When you're building a modern app with internationalization (i18n), it's easy to end up with a bloated bundle. The more languages and messages you have, the more it can grow — fast.

Lingui helps you avoid this by aggressively optimizing how translations are handled in your code and in production builds. But these optimizations can also surprise you if you're not aware of how they work.

This guide walks you through:

- How Lingui shrinks your bundle
- What tradeoffs are involved
- Why development and production behave differently
- How to avoid common pitfalls
- And how to configure Lingui to fit your workflow

## Why does this matter?

Imagine you have a simple message:

```tsx
<Trans>Hello world</Trans>
```

If this message is included _as-is_ in your code and translations, you might end up with:

- The message string `"Hello world"` in your source code
- The same string as a key in your translation catalog
- And again as a value in your default language catalog

That's three copies of the same thing — and you'll have that for _every_ message.

Now multiply that by hundreds of messages and a few languages, and you can see where this is going.

## So how does Lingui fix that?

### 1. It replaces messages with compact IDs

When you build your app, Lingui transforms:

```tsx
<Trans>Hello world</Trans>
```

into something like:

```tsx
<Trans id="zfhb1" />
```

The message is no longer part of the bundle. Instead, it's replaced by a short ID. This does two things:

- Saves space (IDs are shorter than full strings)
- Prevents duplication (only the translation needs to exist, not the original text)

### 2. It removes the message compiler from production

Messages like this:

```js
"{count, plural, one {# item} other {# items}}";
```

use [ICU MessageFormat](https://formatjs.io/docs/core-concepts/icu-syntax), which needs to be _compiled_ into something the Lingui runtime can use.

Lingui includes a message compiler for this, but it's not small.

Instead of sending that to the browser, Lingui compiles messages **ahead of time** during your build when you compile your catalogs. That way, you don't need the compiler in production at all.

That's why you need to always compile your catalogs, even if they are in JSON format (not `.po` files). Compilation isn't about converting file formats — it's about transforming messages into a form the runtime can execute.

:::note
✅ Tip: If you use the `@lingui/vite` or `@lingui/loader`, you don't need to run `lingui compile` manually — these plugins compile your catalogs automatically when you import catalogs.
:::

## But wait... why does everything still work in development?

Here's the clever part: Lingui works differently in dev vs prod.

In **development**, Lingui:

- Keeps the original message (`Hello world`) in the bundle
- Includes the message compiler so new messages work immediately

This makes it fast to iterate. You can add a new `<Trans>` and see the string in the browser right away — even if you haven't extracted or compiled anything yet.

In **production**, Lingui:

- Strips out all original messages
- Removes the message compiler completely

This means you **must** extract and compile all messages ahead of time — otherwise, Lingui won't know how to render them.

## Common Problem: “Why am I seeing weird message IDs in production?”

Let's say you add a new message:

```tsx
<Trans>This is a new message</Trans>
```

Everything looks fine locally, but when you deploy, users see something like:

```text
z3fd2
```

This usually means one thing: the message wasn't extracted before building.

When Lingui compiles your catalogs, it tries to match each message ID to a source message. If the message isn't there, there's nothing to fall back to — and the raw ID ends up in the UI.

### ✅ Solution: Always extract before building

Make sure your build script extracts the latest messages:

```json
"build": "lingui extract-template && vite build"
```

This ensures your catalogs are in sync with your source code.

## But what if I want to load translations dynamically?

That's where the tradeoffs come in.

Lingui's design is optimized for build-time static analysis. It's great for most apps, but it can get tricky if you want to:

- Load translations from a CMS
- Support over-the-air (OTA) delivery of catalogs
- Inject new messages at runtime

In these cases, you can't rely on precompiled catalogs alone — you'll need the **runtime message compiler** again.

To bring it back, use:

```ts
import { compileMessage } from "@lingui/message-utils/compileMessage";

i18n.setMessagesCompiler(compileMessage);
```

Just keep in mind that this will increase your bundle size again.

## Configuring Lingui for your needs

Here are a few ways to customize Lingui's behavior depending on your goals:

### 1. I want production to behave like development

You want to keep original messages and use runtime compilation, even in production — maybe for debugging or dynamic catalogs.

**How to configure:**

```ts
// Macro config
stripMessageField: false;

// Runtime setup
i18n.setMessagesCompiler(compileMessage);
```

### 2. I want full consistency between dev and prod

You want everything to be stripped in both environments. Useful for catching issues early.

**How to configure:**

```ts
// Macro config
stripMessageField: true;

// Runtime setup
i18n.setMessagesCompiler(null);
```

### 3. I want to use default Lingui behavior

You don't change anything. Lingui automatically strips messages in production and keeps them in development.

Just make sure to always run `extract-template` before building.

## Macro Configuration: A quick note

Depending on your setup, Lingui macros can be used in different ways:

- As a standalone **Babel plugin**
- As a [**SWC plugin**](https://github.com/lingui/swc-plugin)
- Through [**babel-plugin-macros**](https://github.com/kentcdodds/babel-plugin-macros/blob/main/other/docs/user.md#config)

Each one configures slightly differently, so check their docs for details.
