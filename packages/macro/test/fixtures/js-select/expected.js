i18n._("{gender, select, male {numOfGuests, plural, one {He invites one guest} other {He invites # guests}} female {She is {gender}} other {They is {gender}}}", {
  gender: gender,
  numOfGuests: numOfGuests
});

i18n._("id", {
  0: "male",
  1: 42,
  gender: gender
}, {
  defaults: "{0, select, male {1, plural, one {He invites one guest} other {He invites # guests}} female {She is {gender}} other {They is {gender}}}"
});

i18n._("{value, select, id {test escaped id} comment {test escaped comment}}", {
  value: value
});
