import { ParentComponent } from "solid-js"
import { useLinguiInternal } from "./I18nProvider"
import { TransNoContext, type TransProps } from "./TransNoContext"

export const Trans: ParentComponent<TransProps> = (props) => {
  let errMessage = undefined
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line solid/reactivity
    errMessage = `Trans component was rendered without I18nProvider.\nAttempted to render message: ${props.message} id: ${props.id}. Make sure this component is rendered inside a I18nProvider.`
  }
  const lingui = useLinguiInternal(errMessage)
  return <TransNoContext {...props} lingui={lingui}>{props.children}</TransNoContext>
}
