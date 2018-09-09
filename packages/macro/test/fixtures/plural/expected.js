const a = /*i18n*/{
  id: "{count, plural, one {# book} other {# books}}",
  values: {
    count: count
  }
};

( /*i18n*/{
  id: "{0, plural, offset:1 =0 {No books} =1 {1 book} other {# books}}",
  values: {
    0: users.length
  }
});

( /*i18n*/{
  id: "id",
  defaults: "{0, plural, one {# book} other {{count} books}}",
  values: {
    0: 42,
    count: count
  }
});

/*i18n: description*/({
  id: "id",
  defaults: "{0, plural, one {# book} other {{count} books}}",
  values: {
    0: 42,
    count: count
  }
});
