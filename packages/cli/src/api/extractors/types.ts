export type ExtractorType = {
  match(filename: string): boolean
  extract(filename: string, targetDir: string, options?: ExtractOptions): void
}

export type BabelOptions = {
  plugins?: Array<string>
  presets?: Array<string>
}

export type ExtractOptions = {
  projectType?: string
  babelOptions?: BabelOptions
}
