export enum BundleType {
  UNIVERSAL = "UNIVERSAL",
  NODE = "NODE",
  NOOP = "NOOP",
  ESM = "ESM",
}

export type BundleDef = {
  type: BundleType,
  externals?: readonly string[]

  /**
   * Optional. Default index.js
   */
  entry?: string;

  /**
   * Name of package in packages/* folder
   */
  packageName: string
  label?: string,
};

export const bundles: readonly BundleDef[] = [
  {
    type: BundleType.UNIVERSAL,
    packageName: "core",
    externals: [
      "@lingui/core/compile"
    ]
  },
  {
    type: BundleType.UNIVERSAL,
    packageName: "core",
    entry: 'compile.entry.ts',
    label: 'compile',
  },
  {
    type: BundleType.UNIVERSAL,
    packageName: 'react',
    externals: ["@lingui/core"]
  },
  {
    type: BundleType.UNIVERSAL,
    packageName: 'detect-locale',
  },
  {
    type: BundleType.NODE,
    packageName: 'babel-plugin-extract-messages',
  },
  {
    type: BundleType.NODE,
    packageName: 'snowpack-plugin',
  },
  {
    type: BundleType.NODE,
    packageName: 'vite-plugin',
  },
  {
    type: BundleType.NODE,
    packageName: 'macro',
  },
  {
    type: BundleType.NODE,
    packageName: "cli"
  },
  {
    type: BundleType.NODE,
    packageName: "conf"

  },
  {
    type: BundleType.NODE,
    packageName: "loader"
  },

  {
    type: BundleType.UNIVERSAL,
    packageName: "remote-loader",
    externals: [
      "@lingui/core/compile"
    ]
  }
]
