import lingui from "./formats/lingui"
import minimal from "./formats/minimal"
import po from "./formats/po"
import configureCatalog from "./catalog"

export { createCompiledCatalog } from "./compile"
export { configureCatalog }
export const formats = { lingui, minimal, po }
