import { normalizeRuntimeConfigModule } from "./normalizeRuntimeConfigModule"

describe("normalizeRuntimeConfigModule", () => {
  test("all defaults", () => {
    const actual = normalizeRuntimeConfigModule({ runtimeConfigModule: {} })

    expect(actual.runtimeConfigModule).toMatchInlineSnapshot(`
      {
        TransImportModule: @lingui/react,
        TransImportName: Trans,
        i18nImportModule: @lingui/core,
        i18nImportName: i18n,
        useLinguiImportModule: @lingui/react,
        useLinguiImportName: useLingui,
      }
    `)
  })

  test("i18n specified as legacy shorthand", () => {
    const actual = normalizeRuntimeConfigModule({
      runtimeConfigModule: ["../my-i18n", "myI18n"],
    })

    expect(actual.runtimeConfigModule).toMatchInlineSnapshot(`
      {
        TransImportModule: @lingui/react,
        TransImportName: Trans,
        i18nImportModule: ../my-i18n,
        i18nImportName: myI18n,
        useLinguiImportModule: @lingui/react,
        useLinguiImportName: useLingui,
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
        TransImportModule: ./custom-trans,
        TransImportName: myTrans,
        i18nImportModule: ./custom-i18n,
        i18nImportName: myI18n,
        useLinguiImportModule: ./custom-use-lingui,
        useLinguiImportName: myLingui,
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
        TransImportModule: ./custom-trans,
        TransImportName: Trans,
        i18nImportModule: ./custom-i18n,
        i18nImportName: i18n,
        useLinguiImportModule: ./custom-use-lingui,
        useLinguiImportName: useLingui,
      }
    `)
  })
})
