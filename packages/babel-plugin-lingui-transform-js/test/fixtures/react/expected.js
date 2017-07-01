i18n._({
  id: "Full content of {articleName}",
  values: {
    articleName: articleName
  }
});
<Trans>Read <a href="/more" title={i18n._({
    id: "Full content of {articleName}",
    values: {
      articleName: articleName
    }
  })}>more</a></Trans>;
<a href="/about" title={i18n._({
  id: "{count, plural, one {# book} other {# books}}",
  values: {
    count: count
  }
})}>About</a>;
