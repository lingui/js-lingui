i18n.select({
  value: gender,
  "male": i18n.plural({
    value: numOfGuests,
    one: "He invites one guest",
    other: "He invites # guests"
  }),
  female: `She is ${gender}`,
  other: `They is ${gender}`
});
i18n.select({
  value: "male",
  "male": i18n.plural({
    value: 42,
    one: "He invites one guest",
    other: "He invites # guests"
  }),
  female: `She is ${gender}`,
  other: `They is ${gender}`
});
