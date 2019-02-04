import { select, plural } from '@lingui/macro'

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

select({
  id: "id",
  value: "male",
  "male": plural({
    value: 42,
    one: "He invites one guest",
    other: "He invites # guests"
  }),
  female: `She is ${gender}`,
  other: `They is ${gender}`
});

select({
  value: value,
  _id: 'test escaped id',
  _comment: 'test escaped comment'
})
