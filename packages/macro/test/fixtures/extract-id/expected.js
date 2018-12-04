( /*i18n*/{
  id: "Variable {name}|test",
  defaults: "Variable {name}",
  values: {
    name: name
  }
});
( /*i18n*/{
  id: "id",
  defaults: "Hello World"
});

( /*i18n*/{
  id: "{0, plural, offset:1 =0 {No books} =1 {1 book} other {# books}}|test",
  defaults: "{0, plural, offset:1 =0 {No books} =1 {1 book} other {# books}}",
  values: {
    0: users.length
  }
});
( /*i18n*/{
  id: "plural.id",
  defaults: "{0, plural, offset:1 =0 {No books} =1 {1 book} other {# books}}",
  values: {
    0: users.length
  }
});

( /*i18n*/{
  id: "{gender, select, male {{numOfGuests, plural, one {He invites one guest} other {He invites # guests}}} female {She is {gender}} other {They is {gender}}}|test",
  defaults: "{gender, select, male {{numOfGuests, plural, one {He invites one guest} other {He invites # guests}}} female {She is {gender}} other {They is {gender}}}",
  values: {
    gender: gender,
    numOfGuests: numOfGuests
  }
});
( /*i18n*/{
  id: "select.id",
  defaults: "{0, select, male {{1, plural, one {He invites one guest} other {He invites # guests}}} female {She is {gender}} other {They is {gender}}}",
  values: {
    0: "male",
    1: 42,
    gender: gender
  }
});
