import { plural } from '@lingui/macro'

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