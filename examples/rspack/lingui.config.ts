import { LinguiConfig } from '@lingui/conf'

const config: Partial<LinguiConfig> = {
    locales: ["en", "fr"],
    sourceLocale: "en",
    catalogs: [{
        path: "src/locales/{locale}/messages",
        include: ["src"]
    }],
};

export default config;