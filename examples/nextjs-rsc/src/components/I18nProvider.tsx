'use client'

import { setupI18n } from '@lingui/core'
import { I18nProvider as LinguiProvider } from '@lingui/react'

type Props = {
  locale: string
  messages?: any
  children: React.ReactNode
}

export function I18nProvider({ locale, messages, ...props }: Props) {
  return (
    <LinguiProvider
      i18n={setupI18n({
        locale,
        messages: { [locale]: messages },
      })}
      {...props}
    />
  );
}