import { t, Trans } from '@lingui/macro'
import { AboutText } from '../../components/AboutText'
import { setI18n } from '../../utils'
import Developers from '../../components/Developers'
import { Switcher } from '../../components/Switcher'
import styles from '../../styles/Index.module.css'

type Params = {
  locale: string
}

type Props = {
  params: Params
  children: React.ReactNode
}

export default function Page({ params }: Props) {
  return (
    <div className={styles.container}>
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

