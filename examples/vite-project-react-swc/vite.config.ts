import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import { lingui } from "@lingui/vite-plugin"
import { linguiMacroSwcPlugin } from "@lingui/swc-plugin/options"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      plugins: [linguiMacroSwcPlugin()],
    }),
    lingui(),
  ],
})
