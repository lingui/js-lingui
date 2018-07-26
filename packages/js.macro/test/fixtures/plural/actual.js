import { plural } from '@lingui/js.macro'
const i18n = setupI18n();
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
