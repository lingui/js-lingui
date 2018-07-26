const i18n = setupI18n();
i18n._("This is my {count, selectordinal, one {#st} two {#nd} other {#rd}} cat", {
  count: count
});
