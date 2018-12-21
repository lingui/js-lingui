import { Trans } from '@lingui/react';

<Trans id="{gender, select, male {He} female {She} other {<0>Other</0>}}|test" defaults="{gender, select, male {He} female {She} other {<0>Other</0>}}" values={{
  gender: gender
}} components={[<strong />]} />;
<Trans id="msg.select" defaults="{gender, select, male {He} female {She} other {<0>Other</0>}}" values={{
  gender: gender
}} components={[<strong />]} />;
<Trans id="{gender, select, female {She} male {He} other {{numGuests, plural, offset:1 =0 {{host} does not give a party.} =1 {{host} invites {guest} to their party.} =2 {{host} invites {guest} and one other person to their party.} other {{host} invites {guest} and # other people to their party.}}}}|test" defaults="{gender, select, female {She} male {He} other {{numGuests, plural, offset:1 =0 {{host} does not give a party.} =1 {{host} invites {guest} to their party.} =2 {{host} invites {guest} and one other person to their party.} other {{host} invites {guest} and # other people to their party.}}}}" values={{
  gender: gender,
  numGuests: numGuests,
  host: host,
  guest: guest
}} />;