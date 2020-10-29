import React from "react"
import { Trans, Plural } from "@lingui/macro"

export default function Lingui({ numUsers, name = "You" }) {
  return (
    <div>
      <h1>
        {/* Localized messages are simply wrapped in <Trans> */}
        <Trans>Internationalization in React</Trans>
      </h1>

      {/* Element attributes are translated using t macro */}
      <img src="./logo.png" alt={t`Logo of Lingui Project`} />

      <p className="lead">
        {/* Variables are passed to messages in the same way as in JSX */}
        <Trans>
          Hello {name}, LinguiJS is a readable, automated, and optimized (5 kb)
          internationalization for JavaScript.
        </Trans>
      </p>

      <p>
        {/* Also React Elements inside messages works in the same way as in JSX */}
        <Trans>
          Read the <a href="https://lingui.js.org">documentation</a>
          for more info.
        </Trans>
      </p>

      {/*
        Plurals are managed using ICU plural rules.
        Content of one/other slots is localized using <Trans>.
        Nesting of i18n components is allowed.
        Syntactically valid message in ICU MessageFormat is guaranteed.
      */}
      <Plural
        value={numUsers}
        one={
          <span>
            Only <strong>one</strong> user is using this library!
          </span>
        }
        other={
          <span>
            <strong>{numUsers}</strong> users are using this library!
          </span>
        }
      />
    </div>
  )
}
