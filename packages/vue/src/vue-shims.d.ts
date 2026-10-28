declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<Record<string, unknown>>
  export default component
}
