// @vitest-environment node

import { setupI18n } from "@lingui/core"
import type { I18nContext } from "./server"

describe("@lingui/react/server", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("reads the i18n scoped by runWithI18n outside an RSC render", async () => {
    const { useLingui } = await import("./index-rsc")
    const { runWithI18n } = await import("./server")
    const i18n = setupI18n({
      locale: "en",
      messages: { en: { hello: "Hello from server" } },
    })

    runWithI18n(i18n, () => {
      expect(useLingui()._({ id: "hello", message: "Hello, world!" })).toBe(
        "Hello from server",
      )
    })
  })

  it("warns once and does not store setI18n outside an active React cache", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const { getI18n, setI18n } = await import("./server")

    setI18n(setupI18n({ locale: "en", messages: { en: {} } }))
    setI18n(setupI18n({ locale: "cs", messages: { cs: {} } }))

    expect(getI18n()).toBeNull()
    const setI18nWarnings = warn.mock.calls.filter((call) =>
      call.join(" ").includes("setI18n"),
    )
    expect(setI18nWarnings).toHaveLength(1)

    const warning = setI18nWarnings[0]!.join(" ")
    expect(warning).toContain("setI18n")
    expect(warning).toContain("Server Component")
    expect(warning).toContain("runWithI18n")
  })

  it("returns the active context from getI18nOrThrow", async () => {
    const { getI18nOrThrow, runWithI18n } = await import("./server")
    const i18n = setupI18n({ locale: "en" })

    runWithI18n(i18n, () => {
      const context = getI18nOrThrow()

      expectTypeOf(context).toEqualTypeOf<I18nContext>()
      expect(context.i18n).toBe(i18n)
    })
  })

  it("throws actionable guidance from getI18nOrThrow without a context", async () => {
    const { getI18nOrThrow } = await import("./server")

    expect(getI18nOrThrow).toThrow(/setI18n/)
    expect(getI18nOrThrow).toThrow(/runWithI18n/)
  })

  it("restores the outer context after nested callbacks", async () => {
    const { getI18n, runWithI18n } = await import("./server")
    const outerI18n = setupI18n({ locale: "en" })
    const innerI18n = setupI18n({ locale: "cs" })

    expect(getI18n()).toBeNull()

    const result = runWithI18n(outerI18n, () => {
      expect(getI18n()?.i18n).toBe(outerI18n)

      expect(
        runWithI18n(innerI18n, () => {
          expect(getI18n()?.i18n).toBe(innerI18n)
          return "inner result"
        }),
      ).toBe("inner result")

      expect(getI18n()?.i18n).toBe(outerI18n)
      return "outer result"
    })

    expect(result).toBe("outer result")
    expect(getI18n()).toBeNull()
  })

  it("restores the outer context after errors", async () => {
    const { getI18n, runWithI18n } = await import("./server")
    const i18n = setupI18n({ locale: "en" })
    const error = new Error("Server Function failed")

    expect(() =>
      runWithI18n(i18n, () => {
        throw error
      }),
    ).toThrow(error)
    expect(getI18n()).toBeNull()

    await expect(
      runWithI18n(i18n, async () => {
        await Promise.resolve()
        throw error
      }),
    ).rejects.toThrow(error)
    expect(getI18n()).toBeNull()
  })

  it("stores and reads the i18n instance during an active RSC render", async () => {
    vi.doMock("react", async (importOriginal) => {
      const actual = await importOriginal<typeof import("react")>()
      return {
        ...actual,
        default: {
          ...actual,
          cache: (fn: (...args: unknown[]) => unknown) => {
            let value: unknown
            let called = false
            return (...args: unknown[]) => {
              if (!called) {
                value = fn(...args)
                called = true
              }
              return value
            }
          },
        },
      }
    })

    const { getI18n, setI18n } = await import("./server")
    const i18n = setupI18n({ locale: "en" })

    expect(getI18n()).toBeNull()
    setI18n(i18n)
    expect(getI18n()?.i18n).toBe(i18n)

    vi.doUnmock("react")
  })

  it("isolates i18n instances in concurrent Server Functions", async () => {
    const { getI18n, runWithI18n } = await import("./server")
    let pending = 2
    let release: () => void
    const bothInitialized = new Promise<void>((resolve) => {
      release = resolve
    })

    const serverFunction = async (locale: string) => {
      return runWithI18n(setupI18n({ locale }), async () => {
        pending -= 1
        if (pending === 0) {
          release()
        }

        await bothInitialized
        return getI18n()?.i18n.locale
      })
    }

    const serverFunctions = [serverFunction("en"), serverFunction("cs")]

    expect(getI18n()).toBeNull()
    await expect(Promise.all(serverFunctions)).resolves.toEqual(["en", "cs"])
    expect(getI18n()).toBeNull()
  })
})
