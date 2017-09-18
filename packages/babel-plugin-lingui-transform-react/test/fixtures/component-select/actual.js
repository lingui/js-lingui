import { Select } from 'lingui-react';

<Select
  value={count}
  male="He"
  female={`She`}
  other={<strong>Other</strong>}
/>;
<Select
  id="msg.select"
  render="strong"
  value={user.gender}
  male="He"
  female={`She`}
  other={<strong>Other</strong>}
/>;
