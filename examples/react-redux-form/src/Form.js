import * as React from "react"
import { compose } from "redux"
import { reduxForm, Field } from "redux-form"
import { withI18n, Trans } from "lingui-react"

const validUsernames = [
  "Dasher",
  "Dancer",
  "Prancer",
  "Vixen",
  "Comet",
  "Cupid",
  "Donner",
  "Blitzen"
]

// validate(values, props) -> errors
function validate({ username, password }, { i18n }) {
  const errors = {}

  if (!username) {
    errors.username = i18n.t`Username is required`
  } else if (validUsernames.indexOf(username)) {
    errors.username = i18n.t`Sorry ${username}, you can't get in.`
  }

  return errors
}

const renderField = field => (
  <div className="input-row">
    <input {...field.input} type="text" />
    {field.meta.touched &&
      field.meta.error && <span className="error">{field.meta.error}</span>}
  </div>
)

function Form({ handleSubmit }) {
  return (
    <form onSubmit={handleSubmit}>
      <Field name="username" component={renderField} />
      <Field name="password" component={renderField} type="password" />
      <button type="submit">
        <Trans>Log in</Trans>
      </button>
    </form>
  )
}

export default compose(withI18n(), reduxForm({ form: "form", validate }))(Form)
