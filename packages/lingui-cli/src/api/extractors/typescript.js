"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _babelCore = require("babel-core");

var _babelPluginLinguiTransformReact = require("babel-plugin-lingui-transform-react");

var _babelPluginLinguiTransformReact2 = _interopRequireDefault(_babelPluginLinguiTransformReact);

var _typescriptLinguiExtractMessages = require("typescript-lingui-extract-messages");

var _typescriptLinguiExtractMessages2 = _interopRequireDefault(_typescriptLinguiExtractMessages);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var typescriptRe = /\.tsx?$/i;

var extractor = {
  match(filename) {
    return typescriptRe.test(filename);
  },

  /*extract(filename, targetDir) {
   console.log("typescript extract", filename);
   }*/
  extract(filename, localeDir) {
    (0, _babelCore.transformFileSync)(filename, {
      plugins: [_babelPluginLinguiTransformReact2.default, [_typescriptLinguiExtractMessages2.default, { localeDir }]]
    });
  }
};

exports.default = extractor;