import { t } from '@lingui/macro'
import { Inter } from "next/font/google"
import "../../styles/globals.css"
import { I18nProvider } from '../../components/I18nProvider'
import { loadCatalog, setI18n } from '../../utils'

type Params = {
  locale: string
}

type Props = {
  params: Params
  children: React.ReactNode
}

const inter = Inter({ subsets: ["latin"] })

export function generateMetadata({ params }: { params: Params }) {
  const { locale } = params
  const i18n = setI18n(locale)
  return {
    title: t(i18n)`Translation Demo`,
  }
}

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'sr' },
    { locale: 'es' },
    { locale: 'pseudo'}
  ]
}

export default function RootLayout({ params, children }: Props) {
  const { locale } = params
  const messages = loadCatalog(locale)
  return (
    <html lang={locale}>
      <body className={inter.className}>
        <I18nProvider locale={locale} messages={messages}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
