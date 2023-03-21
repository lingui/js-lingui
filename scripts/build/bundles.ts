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

export const bundles: readonly BundleDef[] = [
  {
    type: BundleType.UNIVERSAL,
    packageName: "core",
    externals: ["@lingui/core/compile"],
  },
  {
    type: BundleType.UNIVERSAL,
    packageName: "core",
    entry: "compile.entry.ts",
    label: "compile",
  },
  {
    type: BundleType.UNIVERSAL,
    packageName: "react",
    externals: ["@lingui/core"],
  },
  {
    type: BundleType.UNIVERSAL,
    packageName: "detect-locale",
  },
  {
    type: BundleType.NODE,
    packageName: "babel-plugin-extract-messages",
  },
  {
    type: BundleType.CUSTOM,
    packageName: "vite-plugin",
    cmd: "yarn workspace @lingui/vite-plugin build",
  },
  {
    type: BundleType.NODE,
    packageName: "macro",
  },
  {
    type: BundleType.NODE,
    packageName: "cli",
  },
  {
    type: BundleType.CUSTOM,
    packageName: "conf",
    cmd: "yarn workspace @lingui/conf build",
  },
  {
    type: BundleType.NODE,
    packageName: "loader",
  },
  {
    type: BundleType.UNIVERSAL,
    packageName: "remote-loader",
    externals: ["@lingui/core/compile"],
  },
  {
    type: BundleType.CUSTOM,
    packageName: "format-csv",
    cmd: "yarn workspace @lingui/format-csv build",
  },
  {
    type: BundleType.CUSTOM,
    packageName: "format-json",
    cmd: "yarn workspace @lingui/format-json build",
  },
  {
    type: BundleType.CUSTOM,
    packageName: "format-po",
    cmd: "yarn workspace @lingui/format-po build",
  },
  {
    type: BundleType.CUSTOM,
    packageName: "format-po-gettext",
    cmd: "yarn workspace @lingui/format-po-gettext build",
  },
]
