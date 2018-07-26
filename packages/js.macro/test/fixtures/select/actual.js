import { select, plural } from '@lingui/js.macro'
const i18n = setupI18n();
select({
  value: gender,
  "male": plural({
    value: numOfGuests,
    one: "He invites one guest",
    other: "He invites # guests"
  }),
  female: `She is ${gender}`,
  other: `They is ${gender}`
});
select('id', {
  value: "male",
  "male": plural({
    value: 42,
    one: "He invites one guest",
    other: "He invites # guests"
  }),
  female: `She is ${gender}`,
  other: `They is ${gender}`
});
