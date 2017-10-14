// flow-typed signature: 0e6c18548011f75418a9e8abe577da92
// flow-typed version: 8627421170/chalk_v2.x.x/flow_>=v0.19.x

type $npm$chalk$StyleElement = {
  open: string;
  close: string;
};

type $npm$chalk$Chain = $npm$chalk$Style & (...text: any[]) => string;

type $npm$chalk$Style = {
  // General
  reset: $npm$chalk$Chain;
  bold: $npm$chalk$Chain;
  dim: $npm$chalk$Chain;
  italic: $npm$chalk$Chain;
  underline: $npm$chalk$Chain;
  inverse: $npm$chalk$Chain;
  strikethrough: $npm$chalk$Chain;

  // Text colors
  black: $npm$chalk$Chain;
  red: $npm$chalk$Chain;
  green: $npm$chalk$Chain;
  yellow: $npm$chalk$Chain;
  blue: $npm$chalk$Chain;
  magenta: $npm$chalk$Chain;
  cyan: $npm$chalk$Chain;
  white: $npm$chalk$Chain;
  gray: $npm$chalk$Chain;
  grey: $npm$chalk$Chain;

  // Background colors
  bgBlack: $npm$chalk$Chain;
  bgRed: $npm$chalk$Chain;
  bgGreen: $npm$chalk$Chain;
  bgYellow: $npm$chalk$Chain;
  bgBlue: $npm$chalk$Chain;
  bgMagenta: $npm$chalk$Chain;
  bgCyan: $npm$chalk$Chain;
  bgWhite: $npm$chalk$Chain;
};

declare module "chalk" {
  declare var enabled: boolean;
  declare var supportsColor: boolean;

  // General
  declare var reset: $npm$chalk$Chain;
  declare var bold: $npm$chalk$Chain;
  declare var dim: $npm$chalk$Chain;
  declare var italic: $npm$chalk$Chain;
  declare var underline: $npm$chalk$Chain;
  declare var inverse: $npm$chalk$Chain;
  declare var strikethrough: $npm$chalk$Chain;

  // Text colors
  declare var black: $npm$chalk$Chain;
  declare var red: $npm$chalk$Chain;
  declare var green: $npm$chalk$Chain;
  declare var yellow: $npm$chalk$Chain;
  declare var blue: $npm$chalk$Chain;
  declare var magenta: $npm$chalk$Chain;
  declare var cyan: $npm$chalk$Chain;
  declare var white: $npm$chalk$Chain;
  declare var gray: $npm$chalk$Chain;
  declare var grey: $npm$chalk$Chain;

  // Background colors
  declare var bgBlack: $npm$chalk$Chain;
  declare var bgRed: $npm$chalk$Chain;
  declare var bgGreen: $npm$chalk$Chain;
  declare var bgYellow: $npm$chalk$Chain;
  declare var bgBlue: $npm$chalk$Chain;
  declare var bgMagenta: $npm$chalk$Chain;
  declare var bgCyan: $npm$chalk$Chain;
  declare var bgWhite: $npm$chalk$Chain;
}
