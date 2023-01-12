export enum BundleType {
  UNIVERSAL = "UNIVERSAL",
  NODE = "NODE",
  NOOP = "NOOP",
  ESM = "ESM",
}

export type BundleDef = {
  type: BundleType,
  externals?: string[]

  /**
   * Optional. Default index.js
   */
  entry?: string;

  /**
   * Name of package in packages/* folder
   */
  packageName: string
  label?: string,
  // all following not used now
  moduleType?: unknown,
  global?: unknown,
  babel?: unknown,
};

export const bundles: BundleDef[] = [
  {
    type: BundleType.UNIVERSAL,
    packageName: "core",
    externals: []
  },
  {
    type: BundleType.UNIVERSAL,
    packageName: "core",
    entry: 'compile.entry.js',
    label: 'compile',
    externals: []
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
    packageName: "remote-loader"
  }
]

// Based on deep-freeze by substack (public domain)
function deepFreeze(o) {
  Object.freeze(o)
  Object.getOwnPropertyNames(o).forEach(function(prop) {
    if (
      o[prop] !== null &&
      (typeof o[prop] === "object" || typeof o[prop] === "function") &&
      !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop])
    }
  })
  return o
}

// Don't accidentally mutate config as part of the build
deepFreeze(bundles)
