import { t } from '@lingui/macro'

const a = t.plural({
  value: count,
  "one": `# book`,
  other: "# books"
});

t.plural({
  value: users.length,
  offset: 1,
  0: "No books",
  1: "1 book",
  other: "# books"
});

t.plural({
  id: 'id',

  value: 42,
  one: `# book`,
  other: `${count} books`
});

t.plural({
  id: 'id',
  comment: 'Hello World',
  value: 42,

  one: `# book`,
  other: `${count} books`
});
