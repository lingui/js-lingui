import { PluginOption } from "vite"
import { lingui } from "@lingui/vite-plugin"
import { linguiCoreMacros } from "./core-macros-plugin"
import type { Api } from "@vitejs/plugin-vue"
import { transformer } from "../compiler"

type LinguiConfigOpts = {
  cwd?: string
  configPath?: string
  skipValidation?: boolean
}

type Options = {
  suppressRegisteringBabelMacro?: boolean
  linguiConfigOptions?: LinguiConfigOpts
  isProduction?: boolean
}

export function vueLingui(options: Options = {}): PluginOption[] {
  options = {
    suppressRegisteringBabelMacro: false,
    isProduction: process.env.NODE_ENV === "production",
    ...options,
  }

  return [
    lingui(options.linguiConfigOptions),
    !options.suppressRegisteringBabelMacro ? linguiCoreMacros() : false,
    {
      name: "vite-plugin-lingui-vue-transform",
      enforce: "pre",
      configResolved(config) {
        const vitePlugin = config.plugins.find(
          (plugin) => plugin.name === "vite:vue"
        )

        if (!vitePlugin) {
          throw new Error(
            "Lingui Vue Plugin: Vite plugin is not found in your configuration. Please install it and to your Vite config"
          )
        }

        const api = vitePlugin.api as Api

        // register Lingui template transformer
        api.options.template = {
          ...api.options.template,
          compilerOptions: {
            ...api.options.template?.compilerOptions,
            nodeTransforms: [
              transformer({ stripNonEssentialProps: options.isProduction }),
              ...(api.options.template?.compilerOptions?.nodeTransforms || []),
            ],
          },
        }
      },
    },
  ]
}
