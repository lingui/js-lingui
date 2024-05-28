import React, { ReactNode } from 'react'
import { allI18nInstances } from './appRouterI18n'
import { setI18n } from '@lingui/react/server'

export type PageLangParam = {
  params: { lang: string }
}

type PageProps = PageLangParam & {
  searchParams?: any // in query
}

type LayoutProps = PageLangParam & {
  children: React.ReactNode
}

type PageExposedToNextJS<Props extends PageProps> = (props: Props) => ReactNode

export const withLinguiPage = <Props extends PageProps>(
  AppRouterPage: React.ComponentType<PageLangParam & Props>
): PageExposedToNextJS<Props> => {
  return function WithLingui(props) {
    const lang = props.params.lang
    const i18n = allI18nInstances[lang]!
    setI18n(i18n)

    return <AppRouterPage {...props} lang={lang} />
  }
}

type LayoutExposedToNextJS<Props extends LayoutProps> = (
  props: Props
) => ReactNode

export const withLinguiLayout = <Props extends LayoutProps>(
  AppRouterPage: React.ComponentType<PageLangParam & Props>
): LayoutExposedToNextJS<Props> => {
  return function WithLingui(props) {
    const lang = props.params.lang
    const i18n = allI18nInstances[lang]!
    setI18n(i18n)

    return <AppRouterPage {...props} lang={lang} />
  }
}
