import { t, plural, select } from '@lingui/macro'

t`Variable ${name}`;
t("id")`Hello World`;

plural({
  value: users.length,
  offset: 1,
  0: "No books",
  1: "1 book",
  other: "# books"
});
plural("plural.id", {
  value: users.length,
  offset: 1,
  0: "No books",
  1: "1 book",
  other: "# books"
});

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
select('select.id', {
  value: "male",
  "male": plural({
    value: 42,
    one: "He invites one guest",
    other: "He invites # guests"
  }),
  female: `She is ${gender}`,
  other: `They is ${gender}`
});