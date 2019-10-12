export type ExtractorType = {
  match(filename: string): boolean
  extract(filename: string, targetDir: string, options?: ExtractOptions): void
}

export interface BabelOptions {
  plugins?: Array<string>
  presets?: Array<string>
}

export interface ExtractOptions {
  projectType?: string
  babelOptions?: BabelOptions
}
