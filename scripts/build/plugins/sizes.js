/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict"

const gzip = require("gzip-size")

module.exports = function sizes(options) {
  return {
    name: "sizes",
    generateBundle(config, bundle) {
      for (const [name, obj] of Object.entries(bundle)) {
        const size = Buffer.byteLength(obj.code)
        const gzipSize = gzip.sync(obj.code)

        options.getSize(name, size, gzipSize)
      }
    }
  }
}
