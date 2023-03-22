import { CatalogFormatter } from "@lingui/conf"
import { expectAssignable } from "tsd"
import { formatter } from "@lingui/format-json"

expectAssignable<CatalogFormatter>(formatter())
expectAssignable<CatalogFormatter>(
  formatter({ lineNumbers: true, origins: true })
)
