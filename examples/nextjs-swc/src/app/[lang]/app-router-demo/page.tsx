import { HomePage } from '../../../components/HomePage'
import { initLingui } from '../../../initLingui'

export default async function Page(props) {
  const lang = (await props.params).lang
  initLingui(lang)
  return <HomePage />
}
