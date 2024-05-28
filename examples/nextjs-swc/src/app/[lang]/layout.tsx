import linguiConfig from '../../../lingui.config'
import { allI18nInstances, allMessages } from '../../appRouterI18n'
import { LinguiClientProvider } from '../../components/LinguiClientProvider'
import { PageLangParam, withLinguiLayout } from '../../withLingui'
import React from 'react'
import { t } from '@lingui/macro'

export async function generateStaticParams() {
  return linguiConfig.locales.map((lang) => ({ lang }))
}

export function generateMetadata({ params }: PageLangParam) {
  const i18n = allI18nInstances[params.lang]!

  return {
    title: t(i18n)`Translation Demo`
  }
}

export default withLinguiLayout(function RootLayout({
  children,
  params: { lang }
}) {
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
})
