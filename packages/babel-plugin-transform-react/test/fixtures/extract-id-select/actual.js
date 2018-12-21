import { Plural, Select } from '@lingui/react';

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
<Select
  value={gender}
  female={`She`}
  male="He"
  other={
    <Plural
      value={numGuests}
      offset="1"
      _0={`${host} does not give a party.`}
      _1={`${host} invites ${guest} to their party.`}
      _2={`${host} invites ${guest} and one other person to their party.`}
      other={`${host} invites ${guest} and # other people to their party.`}
    />
  }
/>;
