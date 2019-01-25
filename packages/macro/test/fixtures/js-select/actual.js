import { t } from '@lingui/macro'

t.select({
  value: gender,
  "male": t.plural({
    value: numOfGuests,
    one: "He invites one guest",
    other: "He invites # guests"
  }),
  female: `She is ${gender}`,
  other: `They is ${gender}`
});

t.select({
  id: "id",
  value: "male",
  "male": t.plural({
    value: 42,
    one: "He invites one guest",
    other: "He invites # guests"
  }),
  female: `She is ${gender}`,
  other: `They is ${gender}`
});

t.select({
  value: value,
  _id: 'test escaped id',
  _comment: 'test escaped comment'
})
