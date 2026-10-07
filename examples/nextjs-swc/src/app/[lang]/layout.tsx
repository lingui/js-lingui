import linguiConfig from '../../../lingui.config'
import { allMessages } from '../../appRouterI18n'
import { LinguiClientProvider } from '../../components/LinguiClientProvider'
import { initLingui } from '../../initLingui'
import React, {PropsWithChildren} from 'react'
import { msg } from '@lingui/core/macro'

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
  const lang = i18n.locale

  return (
    <html lang={lang}>
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col">
          <LinguiClientProvider
            initialLocale={lang}
            initialMessages={allMessages[lang]!}
          >
            {children}
          </LinguiClientProvider>
        </main>
      </body>
    </html>
  )
}
