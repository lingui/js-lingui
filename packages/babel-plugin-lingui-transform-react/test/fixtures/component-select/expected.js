import { Trans } from 'lingui-react';

<Trans id="{count, select, male {He} female {She} other {<0>Other</0>}}" values={{
  count: count
}} components={[<strong />]} />;
<Trans id="msg.select" render="strong" defaults="{count, select, male {He} female {She} other {<0>Other</0>}}" values={{
  count: count
}} components={[<strong />]} />;
