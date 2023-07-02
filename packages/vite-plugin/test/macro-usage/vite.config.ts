import { createDefaultViteConfig } from "../default-vite.config"
import { UserConfig } from "vite"
import macrosPlugin from "vite-plugin-babel-macros"

const config: UserConfig = {
  ...createDefaultViteConfig(__dirname),
}

config.plugins.push(macrosPlugin())

export default config
