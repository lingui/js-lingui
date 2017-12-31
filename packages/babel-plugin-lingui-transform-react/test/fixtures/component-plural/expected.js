import { Trans } from 'lingui-react';
<Trans id="{count, plural, offset:1 =0 {Zero items} few {{count} items} other {<0>A lot of them</0>}}" values={{
  count: count
}} components={[<a href="/more" />]} />;
<Trans id="msg.plural" render="strong" defaults="{count, plural, offset:1 =0 {Zero items} few {{count} items} other {<0>A lot of them</0>}}" values={{
  count: count
}} components={[<a href="/more" />]} />;
<Trans id="inner-id-removed" defaults="Looking for {0, plural, offset:1 =0 {zero items} few {{1} items {2}} other {<0>a lot of them</0>}}" values={{
  0: items.length,
  1: items.length,
  2: 42
}} components={[<a href="/more" />]} />;
