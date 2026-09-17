/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<Record<string, unknown>>
  export default component
}

declare module "*.po" {
  import type { Messages } from "@lingui/core"
  export const messages: Messages
}
