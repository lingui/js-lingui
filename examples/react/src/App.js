// @flow
import * as React from "react"
import { Layout, Tag, Button, message } from "antd"

import { I18nProvider, I18n } from "@lingui/react"
import { t, Trans, Plural, DateFormat, NumberFormat } from "@lingui/macro"

import LocaleSwitch from "./helpers/LocaleSwitch"
import Navigation from "./helpers/Navigation"
import IntegerStepper from "./helpers/IntegerStepper"
import InputValue from "./helpers/InputValue"

function loadCatalog(locale) {
  /* webpackMode: "lazy", webpackChunkName: "i18n-[index]" */
  return import(`@lingui/loader!./locales/${locale}/messages.po`)
}

const { Header, Content, Footer } = Layout

export default function App() {
  return (
    <LocaleSwitch loadCatalog={loadCatalog}>
      {({ locale, catalogs, activate }) => (
        <I18nProvider language={locale} catalogs={catalogs}>
          <div style={{ padding: "20px 50px" }}>
            <p>
              <Trans>Select language:</Trans>{" "}
              <Navigation locale={locale} activate={activate} />
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

            <p>
              <Trans>
                All messages use ICU MessageFormat, but <Tag>Trans</Tag> macro
                generates this syntax from JSX.
              </Trans>
            </p>

            <h3>
              <Trans>Variables</Trans>
            </h3>

            <p>
              <Trans>Messages can include variables:</Trans>
            </p>

            <I18n>
              {({ i18n }) => (
                <InputValue
                  defaultValue={i18n._(
                    /* i18n: Default value for Hello {name} */ t`World`
                  )}
                  label={i18n._(t`Enter your name`)}
                >
                  {name => (
                    <p>
                      <Trans>Hello {name}</Trans>
                    </p>
                  )}
                </InputValue>
              )}
            </I18n>

            <h3>
              <Trans>Components</Trans>
            </h3>

            <p>
              <Trans>
                <strong>HTML</strong> and <Tag>React components</Tag> works
                without extra configuration.
              </Trans>
            </p>

            <h3>
              <Trans>Props and strings</Trans>
            </h3>

            <p>
              <Trans>
                React props and strings can be translated using <Tag>i18n</Tag>{" "}
                core:
              </Trans>{" "}
              <I18n>
                {({ i18n }) => (
                  <Button
                    onClick={() =>
                      message.info(i18n._(t`You're looking good!`))
                    }
                  >
                    <Trans>Show motto of the day</Trans>
                  </Button>
                )}
              </I18n>
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

            <h3>
              <Trans>Dates</Trans>
            </h3>

            <p>
              <Trans>
                Today is <DateFormat value={new Date()} />
              </Trans>
            </p>

            <h3>
              <Trans>Numbers</Trans>
            </h3>

            <p>
              <Trans>
                It costs{" "}
                <NumberFormat
                  value={2000}
                  format={{ style: "currency", currency: "USD" }}
                />{" "}
                which is{" "}
                <NumberFormat value={0.2} format={{ style: "percent" }} /> of
                our income.
              </Trans>
            </p>
          </div>
        </I18nProvider>
      )}
    </LocaleSwitch>
  )
}
