<Trans>Hi, my name is {name}</Trans>;
<span title={i18n.t`Title`} />;
<span title={i18n.plural({
  count: count,
  one: '# book',
  others: '# books'
})} />;

const a = i18n.t`Title`;
i18n.t`Title`;

const p = i18n.plural({
  value: count,
  one: '# book',
  others: '# books'
});
i18n.plural({
  value: count,
  one: '# book',
  others: '# books'
});
