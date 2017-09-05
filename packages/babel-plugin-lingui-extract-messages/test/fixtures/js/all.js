_("ignore")

i18n._()  // this should be ignored
i18n._("msg.hello")
i18n._("msg.default", { defaults: "Hello World" })
i18n._("msg.default", { defaults: "Hello World" })
i18n._("{count, plural, one {# book} other {# books}}", {
  values: {
    count: count
  }
})
i18n._(message)
