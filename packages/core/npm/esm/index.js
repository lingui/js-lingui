import {
    i18n as i18nProd,
    setupI18n as setupI18nProd,
    formats as formatsProd,
    I18n as I18nProd
} from './core.production.min';

import {
    i18n as i18nDev,
    setupI18n as setupI18nDev,
    formats as formatsDev,
    I18n as I18nDev
} from './core.development';

export const i18n = process.env.NODE_ENV === 'production' ? i18nProd : i18nDev;
export const setupI18n = process.env.NODE_ENV === 'production' ? setupI18nProd : setupI18nDev;
export const formats = process.env.NODE_ENV === 'production' ? formatsProd : formatsDev;
export const I18n = process.env.NODE_ENV === 'production' ? I18nProd : I18nDev;