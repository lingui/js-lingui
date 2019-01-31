import { Select } from '@lingui/macro';

<Select
  value={count}
  _male="He"
  _female={`She`}
  other={<strong>Other</strong>}
/>;
<Select
  id="msg.select"
  render="strong"
  value={user.gender}
  _male="He"
  _female={`She`}
  other={<strong>Other</strong>}
/>;
