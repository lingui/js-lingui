import { t } from "@lingui/core/macro"
import { sharedMsg } from "../components/shared"
import { RED } from "../constants"

const msg: string = t`index page message`
console.log(msg, sharedMsg)
console.log(RED)

export async function test(input: string): Promise<void> {
  console.log("Should support TS type annotation syntax")

  const {showMessage} = await import('../components/dynamic')
  showMessage()
}
