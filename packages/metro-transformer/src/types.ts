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
// an empty key without them. See metro-transform-worker's `getCacheKey`.
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
