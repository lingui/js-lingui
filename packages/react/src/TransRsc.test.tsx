// @vitest-environment node

import { renderToStaticMarkup } from "react-dom/server"
import { setupI18n } from "@lingui/core"
import { TransRsc } from "./TransRsc"

describe("TransRsc", () => {
  afterEach(() => {
    vi.resetModules()
  })

  it("renders using the i18n instance scoped by runWithI18n", async () => {
    const { runWithI18n } = await import("./server")
    const i18n = setupI18n({
      locale: "en",
      messages: { en: { hello: "Hello from server" } },
    })

    const html = runWithI18n(i18n, () =>
      renderToStaticMarkup(<TransRsc id="hello" message="Hello, world!" />),
    )

    expect(html).toBe("Hello from server")
  })

  it("throws an actionable error when no i18n context is available", async () => {
    expect(() =>
      renderToStaticMarkup(<TransRsc id="hello" message="Hello, world!" />),
    ).toThrow(/setI18n|runWithI18n/)
  })
})
