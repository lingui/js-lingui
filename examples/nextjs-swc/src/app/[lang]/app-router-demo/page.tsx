import { HomePage } from '../../../components/HomePage'
import {initLingui, PageLangParam} from '../../../initLingui'

export default async function Page(props: PageLangParam) {
  const lang = (await props.params).lang
  initLingui(lang)
  return <HomePage />
}
