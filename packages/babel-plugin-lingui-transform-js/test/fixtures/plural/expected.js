const a = i18n._({
  id: "{count, plural, one {# book} other {# books}}",
  params: {
    count: count
  }
});
i18n._({
  id: "{count, plural, offset:1 =0 {No books} =1 {1 book} other {# books}}",
  params: {
    count: count
  }
});
i18n._({
  id: "{count, plural, one {# book} other {{count} books}}",
  params: {
    count: count
  }
});
