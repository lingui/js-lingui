import { defineConfig } from "eslint/config"
import pluginReact from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import baseConfig from "../../eslint.config.js"

export default defineConfig(...baseConfig, {
  files: ["**/*.{ts,tsx,js,jsx}"],
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
})
