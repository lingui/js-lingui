import { CatalogFormatter } from "@lingui/conf"
import { formatter } from "@lingui/format-json"
import { expect } from "tstyche"

expect(formatter()).type.toBeAssignableTo<CatalogFormatter>()
expect(
  formatter({ lineNumbers: true, origins: true }),
).type.toBeAssignableTo<CatalogFormatter>()
