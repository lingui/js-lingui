const a = i18n._("{count, plural, one {# book} other {# books}}", {
  values: {
    count: count
  }
});
i18n._("{0, plural, offset:1 =0 {No books} =1 {1 book} other {# books}}", {
  values: {
    0: users.length
  }
});
i18n._("{0, plural, one {# book} other {{count} books}}", {
  values: {
    0: 42,
    count: count
  }
});
