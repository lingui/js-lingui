// taken and redacted (removed unnecessary parts) from
// https://github.com/facebook/metro/blob/main/packages/metro-babel-transformer/types/index.d.ts

export type BabelTransformerArgs = {
  readonly filename: string
  readonly options: unknown // a more precise type would be BabelTransformerOptions, but we don't care about its shape
  readonly plugins?: unknown
  readonly src: string
}

export type BabelTransformer = {
  transform: (args: BabelTransformerArgs) => Promise<{
    ast: unknown
    metadata: unknown
  }>
  getCacheKey?: () => string
}
