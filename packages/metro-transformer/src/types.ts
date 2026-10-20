// taken and redacted (removed unnecessary parts) from
// https://github.com/facebook/metro/blob/main/packages/metro-babel-transformer/types/index.d.ts

export type BabelTransformerArgs = {
  readonly filename: string
  readonly options: unknown // a more precise type would be BabelTransformerOptions, but we don't care about its shape
  readonly plugins?: unknown
  readonly src: string
}

// Metro's published types declare `getCacheKey` as zero-argument, but both
// Metro and Expo call it with these options, and Expo's implementation returns
// an empty key without them. `extendsBabelConfigPath` is Expo-only:
// https://github.com/facebook/metro/blob/b71015ef83904e7086342ddb72205b7242dcd129/packages/metro-transform-worker/src/index.js#L741-L746
// https://github.com/expo/expo/blob/7a6f6ce1e31314ed4c6811147afb6749306dfc8a/packages/%40expo/metro-config/src/transform-worker/metro-transform-worker.ts#L1147-L1154
export type BabelTransformerCacheKeyArgs = {
  readonly projectRoot?: string
  readonly enableBabelRCLookup?: boolean
  readonly extendsBabelConfigPath?: string
}

export type BabelTransformer = {
  transform: (args: BabelTransformerArgs) => Promise<{
    ast: unknown
    metadata: unknown
  }>
  getCacheKey?: (args?: BabelTransformerCacheKeyArgs) => string
}
