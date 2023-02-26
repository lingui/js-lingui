import { t, Trans } from "@lingui/macro"
import { msg as headerMsg } from "../components/header"

// this import should be externalized
// because it's defined in package.json as deps
import { bla } from "some-package"
// resource imports should be externalized
import styles from "./styles.css"
// resource imports with query params should be externalized
import styles2 from "./styles.css?inline"

// should respect tsconfig path aliases
import { msg as msg2 } from "@alias"

const msg = t`about page message`

export default function Page() {
  return <Trans>JSX: about page message</Trans>
}

console.log(msg, headerMsg, bla, styles, styles2, msg2)
