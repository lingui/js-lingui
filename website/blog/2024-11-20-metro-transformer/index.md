---
title: Simplify React Native i18n with the New Metro Transformer
authors: vonovak
tags: [news, features]
image: ./social-card.png
---

![social-card image](./social-card.png)

# Simplified use of Lingui in React Native Apps with `@lingui/metro-transformer`

The new `@lingui/metro-transformer` package brings a more streamlined way to consume translations from `.po` files in Expo and React Native.

It can be used in apps across all platforms supported by React Native (Android, iOS, web and more!) - the only pre-requisite is that you use [Metro bundler](https://metrobundler.dev/) to bundle your app.

<!--truncate-->

Previously, React Native developers would need to follow the two-step process of extracting translations into a `.po` file (with `lingui extract`), and then compiling translated po files into JS/TS files (with `lingui compile`) for production.

Good news! By setting up the `metro-transformer`, you now don't need to perform the second step - it's performed for you during bundling!

:::tip Example
Check out the [React Native example app](https://github.com/lingui/js-lingui/tree/main/examples/react-native) which uses the transformer.
:::

The `@lingui/metro-transformer` package is available as of version 4.12.0. Please let us know if you encounter any issues!

## Getting Started

The **TL;DR** is: install `@lingui/metro-transformer`, update `metro.config.js` and you're ready to go!

For more details - see the official [docs](https://lingui.dev/ref/metro-transformer).

## Exciting Future for Lingui

In case you missed it, Lingui now offers a truly universal support for React — you can use the same syntax for React on the web, React Native, and even in React Server Components (RSC), making it a consistent solution across platforms and environments.

Additionally, keep an eye on Lingui v5 which is packed with new features and bug fixes, and a stable release is just behind the corner. In fact, you can already try v5 with a pre-release version - see the [latest releases on GitHub](https://github.com/lingui/js-lingui/releases)!

As always, thank you to the community for trusting Lingui!
