import { defineConfig } from "eslint/config"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
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
    files: ["packages/**/*.{ts,tsx,js,jsx}"],
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
    files: ["packages/**/*.{js,jsx}"],
    rules: {
      "no-undef": "off",
    },
  },
  {
    files: [
      "packages/**/*.test.{ts,tsx}",
      "packages/**/*.tst.{ts,tsx}",
      "packages/**/test/**/*.{ts,tsx}",
    ],
    rules: {
      "import/no-extraneous-dependencies": "off",
    },
  },
  {
    files: ["packages/react/**/*.{ts,tsx,js,jsx}"],
    extends: [
      pluginReact.configs.flat.recommended,
      pluginReact.configs.flat["jsx-runtime"],
      reactHooks.configs.flat["recommended-latest"],
    ],
    settings: {
      react: {
        version: "18.2",
      },
    },
  },
)
