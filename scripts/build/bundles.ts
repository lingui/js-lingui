export enum BundleType {
  UNIVERSAL = "UNIVERSAL",
  NODE = "NODE",
  CUSTOM = "CUSTOM",
  NOOP = "NOOP",
  ESM = "ESM",
}

export type BundleDef = {
  type: BundleType
  externals?: readonly string[]

  /**
   * Command to execute, used with {@link BundleType.CUSTOM}
   */
  cmd?: string

  /**
   * Optional. Default index.js
   */
  entry?: string

  /**
   * Name of package in packages/* folder
   */
  packageName: string
  label?: string
}

export const bundles: readonly BundleDef[] = []
