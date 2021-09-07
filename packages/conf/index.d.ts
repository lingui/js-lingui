import type { GeneratorOptions } from "@babel/core";

export declare type CatalogFormat = "lingui" | "minimal" | "po" | "csv" | "po-gettext";
export type CatalogFormatOptions = {
    origins?: boolean;
    lineNumbers?: boolean;
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

declare type CatalogService = {
    name: string;
    apiKey: string;
}

declare type ExtractorType = {
    match(filename: string): boolean;
    extract(filename: string, targetDir: string, options?: any): void;
}

export declare type LinguiConfig = {
    catalogs: CatalogConfig[];
    compileNamespace: "es" | "cjs" | "ts" | string;
    extractBabelOptions: Record<string, unknown>;
    compilerBabelOptions: GeneratorOptions;
    fallbackLocales: FallbackLocales;
    format: CatalogFormat;
    extractors?: ExtractorType[];
    prevFormat: CatalogFormat;
    formatOptions: CatalogFormatOptions;
    localeDir: string;
    locales: string[];
    catalogsMergePath: string;
    orderBy: OrderBy;
    pseudoLocale: string;
    rootDir: string;
    runtimeConfigModule: [string, string?];
    sourceLocale: string;
    service: CatalogService;
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
        compilerBabelOptions: GeneratorOptions;
        catalogs: CatalogConfig[];
        compileNamespace: "es" | "ts" | "cjs" | string;
        fallbackLocales: FallbackLocales;
        format: CatalogFormat;
        formatOptions: CatalogFormatOptions;
        locales: string[];
        orderBy: OrderBy;
        pseudoLocale: string;
        rootDir: string;
        runtimeConfigModule: [string, string?];
        sourceLocale: string;
        service: CatalogService;
    };
    deprecatedConfig: {
        fallbackLocale: (config: LinguiConfig & DeprecatedFallbackLanguage) => string;
        localeDir: (config: LinguiConfig & DeprecatedLocaleDir) => string;
        srcPathDirs: (config: LinguiConfig & DeprecatedLocaleDir) => string;
        srcPathIgnorePatterns: (config: LinguiConfig & DeprecatedLocaleDir) => string;
    };
    comment: string;
};
export declare function replaceRootDir(config: LinguiConfig, rootDir: string): LinguiConfig;
/**
 * Replace fallbackLocale with fallbackLocales
 *
 * Released in lingui-conf 0.9
 * Remove anytime after 4.x
 */
declare type DeprecatedFallbackLanguage = {
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
