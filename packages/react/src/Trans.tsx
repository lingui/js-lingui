import { useLinguiInternal } from "./I18nProvider"
import { TransNoContext, type TransProps } from "./TransNoContext"

export function Trans(props: TransProps): React.ReactElement<any, any> | null {
  let errMessage = undefined
  if (process.env.NODE_ENV !== "production") {
    errMessage = `Trans component was rendered without I18nProvider.
Attempted to render message: ${props.message} id: ${props.id}. Make sure this component is rendered inside a I18nProvider.`
  }
  const lingui = useLinguiInternal(errMessage)

  return <TransNoContext {...props} lingui={lingui} />
}
