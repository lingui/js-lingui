const a = i18n._("{count, plural, one {# book} other {# books}}", {
  values: {
    count: count
  }
});
i18n._("{count, plural, offset:1 =0 {No books} =1 {1 book} other {# books}}", {
  values: {
    count: count
  }
});
i18n._("{count, plural, one {# book} other {{count} books}}", {
  values: {
    count: count
  }
});
