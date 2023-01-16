/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const gzip = require("gzip-size")

export default function sizes(options: {getSize(name: string, size: number, gzipSize: number)}) {
  return {
    name: "sizes",
    generateBundle(config, bundle) {
      for (const [name, obj] of Object.entries(bundle)) {
        const code: string = (obj as any).code;
        if (code == null) continue

        const size = Buffer.byteLength(code)
        const gzipSize = gzip.sync(code)

        options.getSize(name, size, gzipSize)
      }
    }
  }
}
