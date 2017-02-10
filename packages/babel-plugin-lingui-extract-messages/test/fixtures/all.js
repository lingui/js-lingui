<span id="ignore" />;
<Trans id="msg.hello" />;
<Trans id="msg.default" defaults="Hello World" />;
<Trans id="msg.default" defaults="Hello World" />;
<Trans id="Hi, my name is <0>{name}</0>" params={{ count }} />;
i18n.t({
  id: "{count, plural, one {# book} others {# books}}",
  params: {
    count: count
  }
})
