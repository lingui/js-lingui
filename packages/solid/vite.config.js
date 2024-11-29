import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import dts from "vite-plugin-dts"

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ["solid-js", "@lingui/core", "@lingui/solid"],
    }
  },
  plugins: [solidPlugin(), dts({ exclude: "**/*.test.{ts,tsx}", tsconfigPath: './tsconfig.json', rollupTypes: true })],
});
