import Link from 'next/link'
import { Trans } from '@lingui/react/macro'
import { initLingui } from '../../../initLingui'
import styles from '../../../styles/Page.module.css'

export default async function AboutPage() {
  const i18n = await initLingui()

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        <Trans>About</Trans>
      </h1>
      <p className={styles.description}>
        <Trans>
          Next.js is an open-source React front-end development web framework
          that enables functionality such as server-side rendering and
          generating static websites for React based web applications. It is a
          production-ready framework that allows developers to quickly create
          static and dynamic JAMstack websites and is used widely by many large
          companies.
        </Trans>
      </p>
      <p>
        <Link href={`/${i18n.locale}`}>
          <Trans>Back to the homepage</Trans>
        </Link>
      </p>
    </main>
  )
}
