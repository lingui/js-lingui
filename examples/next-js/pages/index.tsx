import Link from "next/link"

import { Trans } from "@lingui/macro"

import { Layout } from "lingui-example/components/Layout"
import styles from "./index.module.css"

export default function Home() {
  return (
    <Layout>
      <h1 className={styles.title}>
        <Trans>
          Welcome to <a href="https://lingui.js.org">LinguiJS!</a>
        </Trans>
      </h1>

      <p className={styles.description}>
        <Trans>
          Get started by editing{" "}
          <code className={styles.code}>locale/en/messages.po</code>
        </Trans>
      </p>

      <div className={styles.grid}>
        <a href="https://lingui.js.org" className={styles.card}>
          <h3>
            <Trans>Documentation →</Trans>
          </h3>
          <p>
            <Trans>
              Find in-depth information about LinguiJS features and API.
            </Trans>
          </p>
        </a>

        <Link href="/examples">
          <a className={styles.card}>
            <h3>
              <Trans>Examples →</Trans>
            </h3>
            <p>
              <Trans>Checkout LinguiJS examples and usecases.</Trans>
            </p>
          </a>
        </Link>
      </div>
    </Layout>
  )
}
