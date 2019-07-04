import * as React from "react"
import { Tag, Button, message } from "antd"

import { I18nProvider, useLingui } from "@lingui/react"
import { t, Trans, Plural } from "@lingui/macro"

import { Navigation } from "./helpers/Navigation"
import { IntegerStepper } from "./helpers/IntegerStepper"
import { InputValue } from "./helpers/InputValue"

export default function Root() {
  return (
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  )
}

function App() {
  const { i18n } = useLingui()
  return (
    <div style={{ padding: "20px 50px" }}>
      <p>
        <Trans>Select language:</Trans> <Navigation />
      </p>

      <h1>
        <Trans>LinguiJS example</Trans>
      </h1>

      <p className="lead">
        <Trans>
          This is an example integration of LinguiJS with React apps.
        </Trans>
      </p>

      <h2>
        <Trans>Message formatting</Trans>
      </h2>

      <h3>
        <Trans>Variables</Trans>
      </h3>

      <p>
        <Trans>Messages can include variables:</Trans>
      </p>

      <InputValue defaultValue={t`World`} label={t`Enter your name`}>
        {name => (
          <p>
            <Trans>Hello {name}</Trans>
          </p>
        )}
      </InputValue>

      <h3>
        <Trans>Components</Trans>
      </h3>

      <p>
        <Trans>
          <strong>HTML</strong> and <Tag>React components</Tag> works without
          extra configuration.
        </Trans>
      </p>

      <h3>
        <Trans>Props and strings</Trans>
      </h3>

      <p>
        <Trans>
          React props and strings can be translated using <Tag>i18n</Tag> core:
        </Trans>{" "}
        <Button onClick={() => message.info(t`You're looking good!`)}>
          <Trans>Show motto of the day</Trans>
        </Button>
      </p>

      <h2>
        <Trans>Formatting</Trans>
      </h2>

      <h3>
        <Trans>Plurals</Trans>
      </h3>

      <IntegerStepper>
        {count => (
          <Plural
            value={count}
            _0="There're no books"
            one="There's one book"
            other="There're # books"
          />
        )}
      </IntegerStepper>
    </div>
  )
}
