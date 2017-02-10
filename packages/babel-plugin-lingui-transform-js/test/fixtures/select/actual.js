i18n.select({
  value: gender,
  "male": i18n.plural({
    value: numOfGuests,
    one: "He invites one guest",
    others: "He invites # guests"
  }),
  female: `She is ${gender}`
});
