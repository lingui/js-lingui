// @flow

export type ExtractorType = {
  match(filename: string): boolean,
  extract(filename: string, targetDir: string): void
}
