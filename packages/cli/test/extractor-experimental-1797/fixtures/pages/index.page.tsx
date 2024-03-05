import { Plural, t, Trans } from '@lingui/macro'

import path from 'path'
import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { AboutText } from '../components/AboutText'
import Developers from '../components/Developers'
import { Switcher } from '../components/Switcher'
import styles from '../styles/Index.module.css'
import { loadCatalog } from '../utils'
import { useLingui } from '@lingui/react'

export const getStaticProps: GetStaticProps = async (ctx) => {
  const fileName = __filename
  const cwd = process.cwd()
  const { locale } = ctx

  const pathname = path
    .relative(cwd, fileName)
    .replace('.next/server/pages/', '')
    .replace('.js', '')

  const translation = await loadCatalog(locale || 'en', pathname)
  return {
    props: {
      translation
    }
  }
}

const Index: NextPage = () => {
  /**
   * This hook is needed to subscribe your
   * component for changes if you use t`` macro
   */
  useLingui()

  return (
    <div className={styles.container}>
      <Head>
        {/*
         The Next Head component is not being rendered in the React
         component tree and React Context is not being passed down to the components placed in the <Head>.
         That means we cannot use the <Trans> component here and instead have to use `t` macro.
        */}
        <title>{t`Translation Demo`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Switcher />
        <h1 className={styles.title}>
          <Trans>
            Welcome to <a href="https://nextjs.org">Next.js!</a>
          </Trans>
        </h1>
        <h2>
          <Trans>Plain text</Trans>
        </h2>
        <h2>{t`Plain text`}</h2>
        <h2>
          <Trans>
            <a href="https://nextjs.org">Next.js</a> say hi.
          </Trans>
        </h2>
        <h2>
          <Trans>
            Wonderful framework <a href="https://nextjs.org">Next.js</a> say hi.
          </Trans>
        </h2>
        <h2>
          <Trans>
            Wonderful framework <a href="https://nextjs.org">Next.js</a> say hi.
            And <a href="https://nextjs.org">Next.js</a> say hi.
          </Trans>
        </h2>
        <div className={styles.description}>
          <AboutText />
        </div>
        <Developers />

        <div>
          <Plural value={1} one={'# Person'} other={`# Persons`} />
          <br />
          <Plural value={2} one={'# Person'} other={`# Persons`} />
        </div>
      </main>
    </div>
  )
}

export default Index
