import { Trans as T, DateFormat as D } from 'lingui-react';
<T id="Hello World" />;
<T id="Today is {now,date}" values={{
  now: now
}} />;
<T id="{count, plural, one {Book} other {Books}}" values={{
  count: count
}} />;
