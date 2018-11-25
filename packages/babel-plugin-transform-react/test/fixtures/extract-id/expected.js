import { Trans } from '@lingui/react';

<Trans id="Hello World|test" defaults="Hello World" />;
<Trans id="msg.id" defaults="Hello World" />;
<Trans id="{count, plural, offset:1 =0 {Zero items} few {{count} items} other {<0>A lot of them</0>}}|test" defaults="{count, plural, offset:1 =0 {Zero items} few {{count} items} other {<0>A lot of them</0>}}" values={{
  count: count
}} components={[<a href="/more" />]} />;
<Trans id="msg.plural" defaults="{count, plural, offset:1 =0 {Zero items} few {{count} items} other {<0>A lot of them</0>}}" values={{
  count: count
}} components={[<a href="/more" />]} />;
<Trans id="{gender, select, male {He} female {She} other {<0>Other</0>}}|test" defaults="{gender, select, male {He} female {She} other {<0>Other</0>}}" values={{
  gender: gender
}} components={[<strong />]} />;
<Trans id="msg.select" defaults="{gender, select, male {He} female {She} other {<0>Other</0>}}" values={{
  gender: gender
}} components={[<strong />]} />;