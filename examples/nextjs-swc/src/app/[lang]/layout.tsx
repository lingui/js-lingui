import linguiConfig from '../../../lingui.config'
import { allMessages, getI18nInstance } from '../../appRouterI18n'
import { LinguiClientProvider } from '../../components/LinguiClientProvider'
import { initLingui, PageLangParam } from '../../initLingui'
import React from 'react'
import { t } from '@lingui/macro'
import { setI18n } from '@lingui/react/server'

export async function generateStaticParams() {
  return linguiConfig.locales.map((lang) => ({ lang }))
}

export async function generateMetadata(props: PageLangParam) {
  const i18n = getI18nInstance((await props.params).lang)

  return {
    title: t(i18n)`Translation Demo`
  }
}

export default async function RootLayout({ children, params }) {
  const lang = (await params).lang
  initLingui(lang)

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
