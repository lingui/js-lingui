i18n._({
  id: "Full content of {articleName}",
  params: {
    articleName: articleName
  }
});
<Trans>Read <a href="/more" title={i18n._({
    id: "Full content of {articleName}",
    params: {
      articleName: articleName
    }
  })}>more</a></Trans>;
<a href="/about" title={i18n._({
  id: "{count, plural, one {# book} other {# books}}",
  params: {
    count: count
  }
})}>About</a>;
