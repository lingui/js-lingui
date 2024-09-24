import { describe, expect, it } from "vitest";
import { normalizeRuntimeConfigModule } from "./normalizeRuntimeConfigModule"

describe("normalizeRuntimeConfigModule", () => {
  test("all defaults", () => {
    const actual = normalizeRuntimeConfigModule({ runtimeConfigModule: {} })

    expect(actual.runtimeConfigModule).toMatchInlineSnapshot(`
      {
        Trans: [
          @lingui/react,
          Trans,
        ],
        i18n: [
          @lingui/core,
          i18n,
        ],
        useLingui: [
          @lingui/react,
          useLingui,
        ],
      }
    `)
  })

  test("i18n specified as legacy shorthand", () => {
    const actual = normalizeRuntimeConfigModule({
      runtimeConfigModule: ["../my-i18n", "myI18n"],
    })

    expect(actual.runtimeConfigModule).toMatchInlineSnapshot(`
      {
        Trans: [
          @lingui/react,
          Trans,
        ],
        i18n: [
          ../my-i18n,
          myI18n,
        ],
        useLingui: [
          @lingui/react,
          useLingui,
        ],
      }
    `)
  })

  it("All runtime modules specified", () => {
    const actual = normalizeRuntimeConfigModule({
      runtimeConfigModule: {
        i18n: ["./custom-i18n", "myI18n"],
        Trans: ["./custom-trans", "myTrans"],
        useLingui: ["./custom-use-lingui", "myLingui"],
      },
    })

    expect(actual.runtimeConfigModule).toMatchInlineSnapshot(`
      {
        Trans: [
          ./custom-trans,
          myTrans,
        ],
        i18n: [
          ./custom-i18n,
          myI18n,
        ],
        useLingui: [
          ./custom-use-lingui,
          myLingui,
        ],
      }
    `)
  })

  it("only module is specified", () => {
    const actual = normalizeRuntimeConfigModule({
      runtimeConfigModule: {
        i18n: ["./custom-i18n"],
        Trans: ["./custom-trans"],
        useLingui: ["./custom-use-lingui"],
      },
    })

    expect(actual.runtimeConfigModule).toMatchInlineSnapshot(`
      {
        Trans: [
          ./custom-trans,
          Trans,
        ],
        i18n: [
          ./custom-i18n,
          i18n,
        ],
        useLingui: [
          ./custom-use-lingui,
          useLingui,
        ],
      }
    `)
  })
})
