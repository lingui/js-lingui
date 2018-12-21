import { Plural } from '@lingui/react';

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