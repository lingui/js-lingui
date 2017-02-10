i18n.t({
  id: "{count, plural, one {# book} others {# books}}",
  params: {
    count: count
  }
});
i18n.t({
  id: "{count, plural, offset:1 =0 {No books} =1 {1 book} others {# books}}",
  params: {
    count: count
  }
});
i18n.t({
  id: "{count, plural, one {# book} others {{count} books}}",
  params: {
    count: count
  }
});
