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
  male: `He is ${gender}`,
  female: `She is ${gender}`,
  other: `They is ${gender}`
});
select("select.id", {
  value: gender,
  male: `He is ${gender}`,
  female: `She is ${gender}`,
  other: `They is ${gender}`
});