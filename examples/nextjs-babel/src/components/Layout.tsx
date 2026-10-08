import Head from "next/head"
import classnames from "classnames"
import type { PropsWithChildren } from "react"
import { Trans, useLingui } from "@lingui/react/macro"

import { LocaleSwitcher } from "./LocaleSwitcher"
import styles from "./Layout.module.css"

type Props = PropsWithChildren<{ className?: string }>

export function Layout({ className, children }: Props) {
  // The `t` macro translates with the i18n instance from React context
  const { t } = useLingui()

  return (
    <div className={styles.container}>
      <Head>
        {/*
          `next/head` renders its children outside of the React tree, so React
          context isn't available in there. The title is translated here, in
          the component, with the `t` macro instead of `<Trans>`.
        */}
        <title>{t`Example project using LinguiJS`}</title>
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
        <LocaleSwitcher />
      </footer>
    </div>
  )
}
