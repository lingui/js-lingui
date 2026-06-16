export interface PresetConfig {
  name: string
  files: number
  messagesPerFile: number
  locales: string[]
}

export const PRESETS: Record<string, PresetConfig> = {
  small: {
    name: "small",
    files: 100,
    messagesPerFile: 10,
    locales: ["en", "fr", "de"],
  },
  medium: {
    name: "medium",
    files: 1000,
    messagesPerFile: 10,
    locales: ["en", "fr", "de", "es", "it"],
  },
  large: {
    name: "large",
    files: 5000,
    messagesPerFile: 10,
    locales: ["en", "fr", "de", "es", "it"],
  },
}
