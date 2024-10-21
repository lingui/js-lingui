import { t } from "@lingui/core/macro"
import { RED } from "../constants"

const msg: string = t`index page message`
console.log(msg)
console.log(RED)

function test(input: string): void {
  console.log("Should support TS type annotation syntax")
}
