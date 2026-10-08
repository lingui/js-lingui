import '../../styles/globals.css'
import { PropsWithChildren } from 'react'
import { msg } from '@lingui/core/macro'
import linguiConfig from '../../../lingui.config'
import { initLingui } from '../../initLingui'
import { LinguiClientProvider } from '../../components/LinguiClientProvider'
import { Switcher } from '../../components/Switcher'

// Pre-render every page in every supported locale at build time.
export async function generateStaticParams() {
  return linguiConfig.locales.map((lang) => ({ lang }))
}

export async function generateMetadata() {
  const i18n = await initLingui()

  return {
    title: i18n._(msg`Translation Demo`)
  }
}

export default async function RootLayout({ children }: PropsWithChildren) {
  const i18n = await initLingui()

  return (
    <html lang={i18n.locale}>
      <body>
        {/*
          The I18n instance can't be serialized and sent to the browser, so the
          client gets the active locale and its messages and builds its own one.
        */}
        <LinguiClientProvider
          initialLocale={i18n.locale}
          initialMessages={i18n.messages}
        >
          <header>
            <Switcher />
          </header>
          {children}
        </LinguiClientProvider>
      </body>
    </html>
  )
}
