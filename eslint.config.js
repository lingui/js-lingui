import { defineConfig } from "eslint/config"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import importPlugin from "eslint-plugin-import"

export default defineConfig(
  {
    ignores: [
      "**/dist/**",
      "**/fixtures/**",
      "**/locale/**",
      "**/test/**/expected/**",
      "**/test/**/actual/**",
      "**/loader/test/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    extends: [
      pluginJs.configs.recommended,
      ...tseslint.configs.recommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
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
            "**/*.config.ts",
            "**/*.config.js",
            "scripts/**",
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.{js,jsx}"],
    rules: {
      "no-undef": "off",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/*.tst.{ts,tsx}", "**/test/**/*.{ts,tsx}"],
    rules: {
      "import/no-extraneous-dependencies": "off",
    },
  },
)
