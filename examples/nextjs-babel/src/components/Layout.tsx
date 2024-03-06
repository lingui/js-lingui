import Head from "next/head"
import classnames from "classnames"

import { t, Trans, useLingui } from "@lingui/macro"

import styles from "./Layout.module.css"
import { useRouter } from "next/router"

export function Layout({ title = null, className = "", children }) {
  /**
   * This macro hook is needed to get `t` which
   * is bound to i18n from React.Context
   */
  const { t } = useLingui()
  const router = useRouter()
  const { pathname, asPath, query } = router

  return (
    <div className={styles.container}>
      <Head>
        {/*
         The Next Head component is not being rendered in the React
         component tree and React Context is not being passed down to the components placed in the <Head>.
         That means we cannot use the <Trans> component here and instead have to use `t` macro.
        */}
        <title>{title || t`Example project using LinguiJS`}</title>
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
