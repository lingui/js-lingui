import type { LinguiMacroOptions, TransformOptions } from "@lingui/native-tools"

export type BundlerMacroTransformOptions = {
  /**
   * The same options as in `jsc.parser` in `.swcrc`
   * https://swc.rs/docs/configuration/compilation#jscparser
   *
   * The syntax (ecmascript/typescript) and jsx support is automatically inferred from the filename,
   * you don't need to specify it manually
   */
  parser?: TransformOptions["parser"]

  /**
   * Overrides for macro options inherited from the Lingui config.
   *
   * `descriptorFields` is always set to `"all"` during extraction and cannot be overridden.
   */
  macro?: Omit<Partial<LinguiMacroOptions>, "descriptorFields">
}
