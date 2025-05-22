import { CatalogFormatter } from "@lingui/conf"
import { formatter } from "@lingui/format-csv"
import { expect } from "tstyche"

expect(formatter()).type.toBeAssignableTo<CatalogFormatter>()
