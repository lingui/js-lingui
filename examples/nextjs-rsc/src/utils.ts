import { cache } from 'react'
import { I18n, setupI18n } from '@lingui/core'
import { messages as en } from './locales/en.po'
import { messages as es } from './locales/es.po'
import { messages as sr } from './locales/sr.po'
import { messages as pseudo } from './locales/pseudo.po'

export async function loadCatalogAsync(locale: string) {
    const catalog = await import(`./locales/${locale}.po`)
    return catalog.messages
  }

export function loadCatalog(locale: string) {
    if (locale === 'es') {
        return es;
    }
    if (locale === 'sr') {
        return sr;
    }
    if (locale === 'pseudo') {
        return pseudo;
    }
    return en;
}

export function setI18n(locale: string) {
    const messages = loadCatalog(locale);
    getLinguiCache().current = setupI18n({
        locale,
        messages: { [locale]: messages },
    })
    return getLinguiCache().current
}

export function getI18n() {
    const i18n = getLinguiCache().current
    if (!i18n) {
        throw new Error('No i18n instance has been setup. Make sure to call `setI18n` first in root of your RSC tree before using `getI18n`');
    }
    return i18n
}

const getLinguiCache = cache((): { current: I18n } => ({
    current: setupI18n({
        locale: 'en',
        messages: { en },
    }),
}))
