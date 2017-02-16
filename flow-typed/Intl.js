declare class Format {
  constructor(language: string, format?: string | Object): this;
  format(value: number): string;
}

declare var Intl: {
  NumberFormat: typeof Format;
  DataFormat: typeof Format;
}

