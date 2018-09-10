import { plural } from '@lingui/macro'

const a = plural({
  value: count,
  "one": `# book`,
  other: "# books"
});

plural({
  value: users.length,
  offset: 1,
  0: "No books",
  1: "1 book",
  other: "# books"
});

plural('id', {
  value: 42,
  one: `# book`,
  other: `${count} books`
});

/*i18n: description*/plural('id', {
  value: 42,
  one: `# book`,
  other: `${count} books`
});
