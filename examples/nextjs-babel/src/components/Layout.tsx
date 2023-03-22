import Head from "next/head"
import classnames from "classnames"

import { t, Trans } from "@lingui/macro"

import styles from "./Layout.module.css"
import { useLingui } from "@lingui/react"
import { useRouter } from "next/router"

export function Layout({ title = null, className = "", children }) {
  /**
   * This hook is needed to subscribe your
   * component for changes if you use t`` macro
   */
  useLingui()
  const router = useRouter()
  const { pathname, asPath, query } = router

  // Default props can't be translated at module level because active locale
  // isn't known when module is imported, but rather when component
  // is rendered.
  if (title == null) {
    title = t`Example project using LinguiJS`
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={classnames(styles.main, className)}>{children}</main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Trans>
            Powered by{" "}
            <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
          </Trans>
        </a>
        &nbsp;{" | "}
        <button
          className={styles.link}
          onClick={() =>
            router.push({ pathname, query }, asPath, { locale: "en" })
          }
        >
          English
        </button>
        {" | "}
        <button
          className={styles.link}
          onClick={() =>
            router.push({ pathname, query }, asPath, { locale: "cs" })
          }
        >
          Česky
        </button>
      </footer>
    </div>
  )
}
