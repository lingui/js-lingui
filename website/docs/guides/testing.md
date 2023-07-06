# Testing

Components using [`Trans`](/docs/ref/react.md#trans) or [`useLingui`](/docs/ref/react.md#uselingui) require access to the context of [`I18nProvider`](/docs/ref/react.md#i18nprovider). How you can wrap your component with the I18nProvider depends on the test library you use.

Here is a working example with [react-testing-library](https://testing-library.com/docs/react-testing-library/intro/), using the [wrapper-property](https://testing-library.com/docs/react-testing-library/api#wrapper):

```tsx title="index.js"
import React from "react";
import { getByText, render, act } from "@testing-library/react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

import { messages } from "./locales/en/messages";
import { messages as csMessages } from "./locales/cs/messages";
import App from "./App";

i18n.load({
  en: messages,
  cs: csMessages,
});

const TestingProvider = ({ children }: any) => <I18nProvider i18n={i18n}>{children}</I18nProvider>;

test("Content should be translated correctly in English", () => {
  act(() => {
    i18n.activate("en");
  });
  const { getByTestId, container } = render(<App />, { wrapper: TestingProvider });
  expect(getByTestId("h3-title")).toBeInTheDocument();
  expect(getByText(container, "Language switcher example:")).toBeDefined();
});

test("Content should be translated correctly in Czech", () => {
  act(() => {
    i18n.activate("cs");
  });
  const { getByTestId, container } = render(<App />, { wrapper: TestingProvider });
  expect(getByTestId("h3-title")).toBeInTheDocument();
  expect(getByText(container, "Příklad přepínače jazyků:")).toBeDefined();
});
```

You could define a custom renderer to re-use this TestingProvider, see [react testing library - Custom Render](https://testing-library.com/docs/react-testing-library/setup#custom-render)
