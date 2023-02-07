import { I18n, MessageDescriptor } from "@lingui/core"
import { t, defineMessage, plural, select, selectOrdinal } from "../index"

const i18n = new I18n({})
const test: MessageDescriptor = {
  id: "test",
  message: "test",
}
const value = "test"

/** t`` macro testing */
t`Test`
t`Test ${value}`
t(test)
t(i18n)`test`
t(i18n)`test ${value}`
t(i18n)(test)
// @ts-expect-error Failing suite case - Ok to fail
t(i18n)(false)

/** DefineMessage test */
defineMessage({
  id: "customid",
  comment: "Greetings on the welcome page",
  message: `Welcome, ${value}!`,
  values: {
    value,
  },
})

/** Plural test */
plural(value, {
  one: "# Book",
  other: "# Books",
})

/** Select test */
select(value, {
  male: "he",
  female: "she",
  other: "they",
})

/** Select Ordinal test */
selectOrdinal(value, {
  one: "#st",
  two: "#nd",
  few: "#rd",
  other: "#th",
})
