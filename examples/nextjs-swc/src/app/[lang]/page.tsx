import Link from 'next/link'
import { Trans } from '@lingui/react/macro'
import { initLingui } from '../../initLingui'
import { Developers } from '../../components/Developers'
import styles from '../../styles/Page.module.css'

export default async function HomePage() {
  const i18n = await initLingui()

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        <Trans>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </Trans>
      </h1>
      <p className={styles.description}>
        <Trans>
          This page is a Server Component. It's rendered on the server in the
          language from the URL and shipped to the browser as static HTML.
        </Trans>
      </p>
      <Developers />
      <p>
        {/* Links need the locale prefix, otherwise the proxy redirects */}
        <Link href={`/${i18n.locale}/about`}>
          <Trans>About this example</Trans>
        </Link>
      </p>
    </main>
  )
}
