# Testing

In a React application, components that use [`Trans`](../ref/react.md#trans) or [`useLingui`](../ref/react.md#uselingui) need access to the context provided by [`I18nProvider`](../ref/react.md#i18nprovider). How you wrap your component with the I18nProvider depends on the testing library you're using.

Below is an example using [react-testing-library](https://testing-library.com/docs/react-testing-library/intro/) and its [wrapper-property](https://testing-library.com/docs/react-testing-library/api#wrapper):

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

To avoid repeating the `TestingProvider` setup in multiple tests, consider defining a custom renderer. You can find more about this in the [react testing library - Custom Render](https://testing-library.com/docs/react-testing-library/setup#custom-render) documentation.
