(
/*i18n*/
{
  id: "{gender, select, male {numOfGuests, plural, one {He invites one guest} other {He invites # guests}} female {She is {gender}} other {They is {gender}}}",
  values: {
    gender: gender,
    numOfGuests: numOfGuests
  }
});
(
/*i18n*/
{
  id: "id",
  defaults: "{0, select, male {1, plural, one {He invites one guest} other {He invites # guests}} female {She is {gender}} other {They is {gender}}}",
  values: {
    0: "male",
    1: 42,
    gender: gender
  }
});
/*i18n: description*/

({
  id: "id",
  defaults: "{0, select, male {1, plural, one {He invites one guest} other {He invites # guests}} female {She is {gender}} other {They is {gender}}}",
  values: {
    0: "male",
    1: 42,
    gender: gender
  }
});
