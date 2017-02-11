i18n.t({
  id: "Full content of {articleName}",
  params: {
    articleName: articleName
  }
});

<Trans>Read <a href="/more" title={i18n.t({
    id: "Full content of {articleName}",
    params: {
      articleName: articleName
    }
  })}>more</a></Trans>;
<a href="/about" title={i18n.t({
  id: "{count, plural, one {# book} others {# books}}",
  params: {
    count: count
  }
})}>About</a>;
