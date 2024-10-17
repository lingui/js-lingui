import React from "react"
import { getByText, render, act } from "@testing-library/react"
import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import App from "./App"

i18n.load({
  en: {
    "zg/nOF": "Language switcher example: ",
  },
  cs: {
    "zg/nOF": "Příklad přepínače jazyků: ",
  },
})

const TestingProvider = ({ children }: any) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
)

test("Test that lang is translated correctly in English", () => {
  act(() => {
    i18n.activate("en")
  })
  const { getByTestId, container } = render(<App />, {
    wrapper: TestingProvider,
  })
  expect(getByTestId("h3-title")).toBeInTheDocument()
  expect(getByText(container, "Language switcher example:")).toBeDefined()
})

test("Test that lang is translated correctly in Czech", () => {
  act(() => {
    i18n.activate("cs")
  })
  const { getByTestId, container } = render(<App />, {
    wrapper: TestingProvider,
  })
  expect(getByTestId("h3-title")).toBeInTheDocument()
  expect(getByText(container, "Příklad přepínače jazyků:")).toBeDefined()
})
