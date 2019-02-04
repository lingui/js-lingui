import i18n from "@lingui/core";
const T = <Trans id="Read <0>more</0>" components={{
  0: <a href="/more" title={i18n._("Full content of {articleName}", {
    articleName: articleName
  })} />
}} />;
const P = <a href="/about" title={i18n._("{count, plural, one {# book} other {# books}}", {
  count: count
})}>About</a>;
