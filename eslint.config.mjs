import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"
import { config } from "typescript-eslint"
import importPlugin from "eslint-plugin-import"

export default config(
  { files: ["./packages/**/*.{ts,tsx,js,jsx}"] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: importPlugin,
    },
  },
  importPlugin.flatConfigs.typescript,
  {
    ignores: [
      "**/dist/*",
      "**/fixtures/*",
      "**/locale/*",
      "**/test/**/expected/*",
      "**/test/**/actual/*",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
          allowTernary: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "**/test/**",
            "**/*.test.{ts,tsx}",
            "**/*.tst.{ts,tsx}",
            "**/vite.config.ts",
          ],
        },
      ],
      "no-undef": "off",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/*.tst.{ts,tsx}", "eslint.config.mjs"],
    rules: {
      "import/no-extraneous-dependencies": "off",
    },
  },
  {
    files: ["./packages/react/*.{ts,tsx,js,jsx}"],
    ...pluginReact.configs.flat.recommended,
  }
)
