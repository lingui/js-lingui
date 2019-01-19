import { Trans } from "@lingui/react";
<Trans id="{count, select, male {He} female {She} other {<0>Other</0>}}" values={{
  count: count
}} components={[<strong />]} />;
<Trans id="msg.select" render="strong" defaults="{0, select, male {He} female {She} other {<0>Other</0>}}" values={{
  0: user.gender
}} components={[<strong />]} />;
