import { Fragment, type PropsWithChildren } from 'react'
import { I18nProvider } from "@lingui/react"
import type { AnyRouter } from '@tanstack/react-router'
import { type I18n } from '@lingui/core'

type AdditionalOptions = {
  WrapProvider?: (props: { children: any }) => React.JSX.Element
}

export type ValidateRouter<TRouter extends AnyRouter> =
  NonNullable<TRouter['options']['context']> extends {
    i18n: I18n
  }
    ? TRouter
    : never

export function routerWithLingui<TRouter extends AnyRouter>(
  router: ValidateRouter<TRouter>,
  i18n: I18n,
  additionalOpts?: AdditionalOptions,
): TRouter {
  const ogOptions = router.options

  router.options = {
    ...router.options,
    dehydrate: () => {
      return {
        ...ogOptions.dehydrate?.(),
        // When critical data is dehydrated, we also dehydrate the i18n messages
        dehydratedI18n: {
            locale: i18n.locale,
            messages: i18n.messages,
        },
      }
    },
    hydrate: (dehydrated: any) => {
      ogOptions.hydrate?.(dehydrated)
      // On the client, hydrate the i18n catalog with the dehydrated data
      i18n.loadAndActivate({
        locale: dehydrated.dehydratedI18n.locale,
        messages: dehydrated.dehydratedI18n.messages,
      })
    },
    context: {
      ...ogOptions.context,
      // Pass the query client to the context, so we can access it in loaders
      i18n,
    },
    // Wrap the app in a I18nProvider
    Wrap: ({ children }: PropsWithChildren) => {
      const OuterWrapper = additionalOpts?.WrapProvider || Fragment
      const OGWrap = ogOptions.Wrap || Fragment

      return <OuterWrapper>
          <I18nProvider i18n={i18n}>
            <OGWrap>{children}</OGWrap>
          </I18nProvider>
        </OuterWrapper>
    },
  }

  return router
}
