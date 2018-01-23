import lingui from "./formats/lingui"
import minimal from "./formats/minimal"

export { createCompiledCatalog } from "./compile"
// export * from "./extract"
// export * from "./stats"

export const formats = {
  lingui,
  minimal
}
