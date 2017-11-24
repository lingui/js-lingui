const a = i18n.plural({
  value: count,
  "one": `# book`,
  other: "# books"
});
i18n.plural({
  value: users.length,
  offset: 1,
  0: "No books",
  1: "1 book",
  other: "# books"
});
i18n.plural({
  value: 42,
  one: `# book`,
  other: `${count} books`
});
