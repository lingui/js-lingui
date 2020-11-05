export declare type CatalogFormat = "lingui" | "minimal" | "po" | "csv";
export type CatalogFormatOptions = {
    origins?: boolean;
}
export declare type OrderBy = "messageId" | "origin";
declare type CatalogConfig = {
    name?: string;
    path: string;
    include: string[];
    exclude?: string[];
};

export type LocaleObject = {
    [locale: string]: string[] | string
}

export type DefaultLocaleObject = {
    default: string
}

export declare type FallbackLocales = LocaleObject | DefaultLocaleObject

export declare type LinguiConfig = {
    catalogs: CatalogConfig[];
    compileNamespace: string;
    extractBabelOptions: Object;
    fallbackLocales: FallbackLocales;
    format: CatalogFormat;
    prevFormat: CatalogFormat;
    formatOptions: CatalogFormatOptions;
    localeDir: string;
    locales: string[];
    catalogsMergePath?: string;
    orderBy: OrderBy;
    pseudoLocale: string;
    rootDir: string;
    runtimeConfigModule: [string, string?];
    sourceLocale: string;
};
export declare const defaultConfig: LinguiConfig;
export declare function getConfig({ cwd, configPath, skipValidation, }?: {
    cwd?: string;
    configPath?: string;
    skipValidation?: boolean;
}): LinguiConfig;
export declare const configValidation: {
    exampleConfig: {
        extractBabelOptions: {
            extends: string;
            rootMode: string;
            plugins: string[];
            presets: string[];
        };
        catalogs: CatalogConfig[];
        compileNamespace: string;
        fallbackLocales: FallbackLocales;
        format: CatalogFormat;
        formatOptions: CatalogFormatOptions;
        locales: string[];
        orderBy: OrderBy;
        pseudoLocale: string;
        rootDir: string;
        runtimeConfigModule: [string, string?];
        sourceLocale: string;
    };
    deprecatedConfig: {
        fallbackLanguage: (config: LinguiConfig & DeprecatedFallbackLanguage) => string;
        fallbackLocale: (config: LinguiConfig & DeprecatedFallbackLanguage) => string;
        localeDir: (config: LinguiConfig & DeprecatedLocaleDir) => string;
        srcPathDirs: (config: LinguiConfig & DeprecatedLocaleDir) => string;
        srcPathIgnorePatterns: (config: LinguiConfig & DeprecatedLocaleDir) => string;
    };
    comment: string;
};
export declare function replaceRootDir(config: LinguiConfig, rootDir: string): LinguiConfig;
/**
 * Replace fallbackLanguage with fallbackLocale
 *
 * Released in lingui-conf 0.9
 * Remove anytime after 3.x
 */
declare type DeprecatedFallbackLanguage = {
    fallbackLanguage: string | null;
    fallbackLocale: string | null;
};

export declare function fallbackLanguageMigration(config: LinguiConfig & DeprecatedFallbackLanguage): LinguiConfig;
/**
 * Replace localeDir, srcPathDirs and srcPathIgnorePatterns with catalogs
 *
 * Released in @lingui/conf 3.0
 * Remove anytime after 4.x
 */
declare type DeprecatedLocaleDir = {
    localeDir: string;
    srcPathDirs: string[];
    srcPathIgnorePatterns: string[];
};
export declare function catalogMigration(config: LinguiConfig & DeprecatedLocaleDir): LinguiConfig;
export {};
//# sourceMappingURL=index.d.ts.map
