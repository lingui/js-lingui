import path from "path"
import { describe } from "vitest"
import { linguiTransformerBabelPreset } from "../src"
import { runVite } from "./run-vite"
import babelPlugin from "@rolldown/plugin-babel"

describe("linguiTransformerBabelPreset", () => {
  it("should return preset with default config", async () => {
    const preset = linguiTransformerBabelPreset(
      {},
      {
        configPath: path.join(
          import.meta.dirname,
          "./transformer-babel-preset/lingui.config.js",
        ),
      },
    )

    expect(preset).toMatchInlineSnapshot(`
      {
        "preset": {
          "plugins": [
            [
              "@lingui/babel-plugin-lingui-macro",
              {},
            ],
          ],
        },
        "rolldown": {
          "filter": {
            "code": /from \\['"\\]\\(\\?:@lingui\\\\/core\\\\/macro\\|@lingui\\\\/react\\\\/macro\\)\\['"\\]/,
          },
        },
      }
    `)

    const filter = preset.rolldown.filter!.code as RegExp

    expect(filter.test("import {t} from '@lingui/core/macro'")).toBeTruthy()
    expect(filter.test(`import {t} from "@lingui/core/macro"`)).toBeTruthy()
    expect(filter.test(`import {t} from "@lingui/react/macro"`)).toBeTruthy()
  })

  it("should return preset with macroId overrides", async () => {
    const preset = linguiTransformerBabelPreset(
      {},
      {
        configPath: path.join(
          import.meta.dirname,
          "./transformer-babel-preset/custom-macro-id.lingui.config.js",
        ),
      },
    )

    expect(preset).toMatchInlineSnapshot(`
      {
        "preset": {
          "plugins": [
            [
              "@lingui/babel-plugin-lingui-macro",
              {},
            ],
          ],
        },
        "rolldown": {
          "filter": {
            "code": /from \\['"\\]\\(\\?:@myapp\\\\/core\\\\/macro\\|@myapp\\\\/jsx\\\\/macro\\)\\['"\\]/,
          },
        },
      }
    `)

    const filter = preset.rolldown.filter!.code as RegExp

    expect(filter.test("import {t} from '@myapp/core/macro'")).toBeTruthy()
    expect(filter.test(`import {t} from "@myapp/core/macro"`)).toBeTruthy()
    expect(filter.test(`import {t} from "@myapp/jsx/macro"`)).toBeTruthy()
  })

  it("should apply plugin to a file with macro", async () => {
    const cwd = path.join(import.meta.dirname, "./transformer-babel-preset")
    process.chdir(cwd)

    const preset = linguiTransformerBabelPreset()
    const { mod } = await runVite("./transformer-babel-preset", [
      babelPlugin({ presets: [preset] }),
    ])
    expect(await mod.load()).toMatchInlineSnapshot(`"Ola"`)
  })
})
