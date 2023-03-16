import { UserConfig } from "vite"
import { lingui } from "../src/index"
import path from "path"

export function createDefaultViteConfig(dirname: string): UserConfig {
  return {
    build: {
      lib: {
        entry: path.resolve(dirname, "entrypoint.js"),
        fileName: "bundle",
        formats: ["cjs"],
      },
    },

    plugins: [
      lingui({
        cwd: dirname,
      }),
    ],
  }
}
