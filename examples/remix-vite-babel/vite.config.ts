import { lingui } from "@lingui/vite-plugin";
import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import macrosPlugin from "vite-plugin-babel-macros";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  plugins: [
    remix(),
    macrosPlugin(),
    lingui(),
    tsconfigPaths()
  ],
});
