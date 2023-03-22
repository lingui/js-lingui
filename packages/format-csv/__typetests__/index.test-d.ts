import { CatalogFormatter } from "@lingui/conf"
import { expectAssignable } from "tsd"
import { formatter } from "@lingui/format-csv"

expectAssignable<CatalogFormatter>(formatter())
