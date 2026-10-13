import type { GetStaticProps } from "next"
import Link from "next/link"
import { Trans } from "@lingui/react/macro"

import { Layout } from "../components/Layout"
import { loadCatalog } from "../i18n"
import styles from "./index.module.css"

export const getStaticProps: GetStaticProps = async (ctx) => {
  const translation = await loadCatalog(ctx.locale!)
  return {
    props: {
      translation,
    },
  }
}

export default function Home() {
  return (
    <Layout className={styles.main}>
      <h1 className={styles.title}>
        <Trans>
          Welcome to <a href="https://lingui.dev">LinguiJS!</a>
        </Trans>
      </h1>
      <p className={styles.description}>
        <Trans>
          Get started by editing{" "}
          <code className={styles.code}>src/pages/index.tsx</code>
        </Trans>
      </p>
      <div className={styles.grid}>
        <a href="https://lingui.dev" className={styles.card}>
          <h3>
            <Trans>Documentation →</Trans>
          </h3>
          <p>
            <Trans>
              Find in-depth information about LinguiJS features and API.
            </Trans>
          </p>
        </a>

        {/* `Link` adds the current locale prefix to the URL on its own */}
        <Link href="/examples" className={styles.card}>
          <h3>
            <Trans>Examples →</Trans>
          </h3>
          <p>
            <Trans>Check out LinguiJS examples and use cases.</Trans>
          </p>
        </Link>
      </div>
    </Layout>
  )
}
