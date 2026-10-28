/// <reference types="vite/client" />

declare module "*?mock=automock" {
  export const greeting: import("@lingui/core").MessageDescriptor
}
