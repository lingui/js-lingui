import { normalizeRuntimeConfigModule } from "./normalizeRuntimeConfigModule"

describe("normalizeRuntimeConfigModule", () => {
  it("only i18n specified", () => {
    const actual = normalizeRuntimeConfigModule({
      runtimeConfigModule: ["../my-i18n", "myI18n"],
    })

    expect(actual.runtimeConfigModule).toStrictEqual({
      TransImportModule: "@lingui/react",
      TransImportName: "Trans",
      i18nImportModule: "../my-i18n",
      i18nImportName: "myI18n",
    })
  })

  it("Trans and i18n specified", () => {
    const actual = normalizeRuntimeConfigModule({
      runtimeConfigModule: {
        i18n: ["./custom-i18n", "myI18n"],
        Trans: ["./custom-trans", "myTrans"],
      },
    })

    expect(actual.runtimeConfigModule).toStrictEqual({
      TransImportModule: "./custom-trans",
      TransImportName: "myTrans",
      i18nImportModule: "./custom-i18n",
      i18nImportName: "myI18n",
    })
  })

  it("i18n specified as object", () => {
    const actual = normalizeRuntimeConfigModule({
      runtimeConfigModule: {
        i18n: ["./custom-i18n", "myI18n"],
      },
    })

    expect(actual.runtimeConfigModule).toStrictEqual({
      TransImportModule: "@lingui/react",
      TransImportName: "Trans",
      i18nImportModule: "./custom-i18n",
      i18nImportName: "myI18n",
    })
  })

  it("Trans specified as object", () => {
    const actual = normalizeRuntimeConfigModule({
      runtimeConfigModule: {
        Trans: ["./custom-trans", "myTrans"],
      },
    })

    expect(actual.runtimeConfigModule).toStrictEqual({
      TransImportModule: "./custom-trans",
      TransImportName: "myTrans",
      i18nImportModule: "@lingui/core",
      i18nImportName: "i18n",
    })
  })
})
