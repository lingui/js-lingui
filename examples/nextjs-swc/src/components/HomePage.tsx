import React from 'react'
import { useLingui } from '@lingui/react'
import Head from 'next/head'
import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { Switcher } from './Switcher'
import { AboutText } from './AboutText'
import Developers from './Developers'
import styles from '../styles/Index.module.css'

export const HomePage = () => {
  const { i18n } = useLingui()

  return (
    <div className={styles.container}>
      <Head>
        {/*
         The Next Head component is not being rendered in the React
         component tree and React Context is not being passed down to the components placed in the <Head>.
         That means we cannot use the <Trans> component here and instead have to use `t` macro.
        */}
        <title>{t(i18n)`Translation Demo`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Switcher />
        <h1 className={styles.title}>
          <Trans>
            Welcome to <a href="https://nextjs.org">Next.js!</a>
          </Trans>
        </h1>
        <div className={styles.description}>
          <AboutText />
        </div>
        <Developers />
      </main>
    </div>
  )
}
