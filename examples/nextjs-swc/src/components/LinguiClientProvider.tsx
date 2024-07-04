'use client'

import { I18nProvider } from '@lingui/react'
import { type Messages, setupI18n } from '@lingui/core'
import { useState } from 'react'

type Props = {
  children: React.ReactNode
  initialLocale: string
  initialMessages: Messages
}

export function LinguiClientProvider({
  children,
  initialLocale,
  initialMessages
}: Props) {
  const [i18n] = useState(() => {
    return setupI18n({
      locale: initialLocale,
      messages: { [initialLocale]: initialMessages }
    })
  })
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
