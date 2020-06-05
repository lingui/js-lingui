import React from "react"
import { Trans, Plural, plural } from "@lingui/macro"
import { useLingui } from "@lingui/react"

const Inbox = ({
  messages = ["a", "b"],
  markAsRead,
  user = {
    name: "Tien",
    lastLogin: Date.now(),
  },
}) => {
  const { i18n } = useLingui()
  const messagesCount = 5
  const friends = 5
  const { name } = user
  const company = "Company"

  return (
    <>
      <h1>
        <Trans>News</Trans>
      </h1>

      <p>
        <Trans>Hello {name}</Trans>
      </p>
      <Trans id="contact.form.identity.not_twitter" values={{ name }} />

      <p>
        <Trans id="device.validation.suceed">
          The device is now verified, you can continue to use{" "}
          <a href="/">{company}</a>.
        </Trans>
      </p>

      <p>
        <Plural
          value={messagesCount}
          one="There is # comment"
          other="There are # comments"
        />
      </p>

      <p>
        {i18n._(
          plural(2, {
            one: "You have # friend",
            other: "You have # friends",
          })
        )}
        <Plural
          value={friends}
          one="You have # friend"
          other="You have # friends"
        />
      </p>

      <footer>
        <Trans>Last login on</Trans>
      </footer>
    </>
  )
}

export default Inbox
