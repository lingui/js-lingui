// Check support typescript's NodeNext moduleResolution with dual `@lingui` packages
// https://github.com/microsoft/TypeScript/issues/50466

import { i18n } from "@lingui/core"
import { Trans } from "@lingui/react"
import { t as t1 } from "@lingui/macro"
import { t } from "@lingui/core/macro"
import { Trans as TransMacro } from "@lingui/react/macro"

console.log(i18n)
console.log(Trans)
console.log(t1, t, TransMacro)
