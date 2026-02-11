import { CatalogFormatter } from "@lingui/conf"
import { formatter } from "@lingui/format-po-gettext"
import { expect } from "tstyche"

expect(formatter()).type.toBeAssignableTo<CatalogFormatter>()
expect(
  formatter({
    lineNumbers: true,
    origins: true,
    printLinguiId: true,
    disableSelectWarning: true,
  }),
).type.toBeAssignableTo<CatalogFormatter>()
