import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'
import { updateLocale } from '~/functions/locale';
import { dynamicActivate, locales } from '~/modules/lingui/i18n'

export const Route = createFileRoute('/$lang')({
  component: Outlet,
  async loader({ context, params }) {
    if (!Object.keys(locales).includes(params.lang)) {
        return notFound();
    }

    if (context.i18n.locale !== params.lang) {
        await updateLocale({ data: params.lang}) // Persist the locale in the cookies
        await dynamicActivate(context.i18n, params.lang)
    }
  },
})
