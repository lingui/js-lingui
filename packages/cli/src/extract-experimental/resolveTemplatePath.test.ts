import { resolveTemplatePath } from "./resolveTemplatePath"
import os from "os"

const skipOnWindows = os.platform().startsWith("win") ? describe.skip : describe

skipOnWindows("resolveTemplateName", () => {
  const rootDir = "/Users/lingui-app"

  test("Should use `messages` suffix when {entryName} defined in output", () => {
    const entrypoint = `${rootDir}/pages/about/index.ts`
    const output = `${rootDir}/locales/{entryDir}/{entryName}.{locale}`

    const actual = resolveTemplatePath(entrypoint, output, rootDir, ".pot")
    expect(actual).toMatchInlineSnapshot(
      `/Users/lingui-app/locales/pages/about/index.messages.pot`
    )
  })

  test("should use `entryName` when {entryName} is not defined in output", () => {
    const entrypoint = `${rootDir}/pages/about/index.ts`
    const output = `${rootDir}/locales/{entryDir}/{locale}`

    const actual = resolveTemplatePath(entrypoint, output, rootDir, ".json")
    expect(actual).toMatchInlineSnapshot(
      `/Users/lingui-app/locales/pages/about/index.json`
    )
  })

  test("should be able to store template next to an entry", () => {
    const entrypoint = `${rootDir}/pages/trip/day/[day].page.tsx`
    const output = `${rootDir}/{entryDir}/locales/{locale}`

    const actual = resolveTemplatePath(entrypoint, output, rootDir, ".pot")
    expect(actual).toMatchInlineSnapshot(
      `/Users/lingui-app/pages/trip/day/locales/[day].page.pot`
    )
  })
})
