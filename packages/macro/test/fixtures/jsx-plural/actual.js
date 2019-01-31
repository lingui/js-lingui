import { Trans, Plural } from '@lingui/macro';

<Plural
  value={count}
  offset="1"
  _0="Zero items"
  few={`${count} items`}
  other={<a href="/more">A lot of them</a>}
/>;
<Plural
  id="msg.plural"
  render="strong"
  value={count}
  offset="1"
  _0="Zero items"
  few={`${count} items`}
  other={<a href="/more">A lot of them</a>}
/>;
<Trans id="inner-id-removed">
  Looking for{" "}
  <Plural
    value={items.length}
    offset={1}
    _0="zero items"
    few={`${items.length} items ${42}`}
    other={<a href="/more">a lot of them</a>}
  />
</Trans>
