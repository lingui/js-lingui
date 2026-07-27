import { t } from "@lingui/core/macro"
import { msg as headerMsg } from "../components/header"
import { sharedMsg } from "../components/shared"
import { GREEN } from "../constants"

const msg = t`about page message`

console.log(msg, headerMsg, sharedMsg)
console.log(GREEN)
