import { CatalogFormatter } from "@lingui/conf"
import { expectAssignable } from "tsd"
import { formatter } from "@lingui/format-po"

expectAssignable<CatalogFormatter>(formatter())
expectAssignable<CatalogFormatter>(
  formatter({
    lineNumbers: true,
    origins: true,
    printLinguiId: true,
  })
)
