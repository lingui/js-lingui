i18n.plural({
  value: count,
  "one": `# book`,
  others: "# books"
});
i18n.plural({
  value: count,
  offset: 1,
  0: "No books",
  1: "1 book",
  others: "# books"
});
i18n.plural({
  value: count,
  one: `# book`,
  others: `${count} books`
});
