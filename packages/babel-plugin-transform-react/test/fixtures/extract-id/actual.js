import { Trans, Plural, Select } from '@lingui/react';

<Trans>Hello World</Trans>;
<Trans id="msg.id">Hello World</Trans>;
<Plural
  value={count}
  offset="1"
  _0="Zero items"
  few={`${count} items`}
  other={<a href="/more">A lot of them</a>}
/>;
<Plural
  id="msg.plural"
  value={count}
  offset="1"
  _0="Zero items"
  few={`${count} items`}
  other={<a href="/more">A lot of them</a>}
/>;
<Select
  value={gender}
  male="He"
  female={`She`}
  other={<strong>Other</strong>}
/>;
<Select
  id="msg.select"
  value={gender}
  male="He"
  female={`She`}
  other={<strong>Other</strong>}
/>;
