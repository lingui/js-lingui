import { defineConfig } from '@lingui/cli'

export default defineConfig({
    locales: ["en", "fr"],
    sourceLocale: "en",
    catalogs: [{
        path: "src/locales/{locale}/messages",
        include: ["src"]
    }],
});