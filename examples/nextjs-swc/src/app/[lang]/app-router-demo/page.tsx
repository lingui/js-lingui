import { HomePage } from '../../../components/HomePage'
import { initLingui } from '../../../initLingui'

export default async function Page() {
  await initLingui()
  return <HomePage />
}
