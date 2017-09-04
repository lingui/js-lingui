import { Select, Plural } from 'lingui-react';

<Select
  value={genderOfHost}
  female={
    <Plural
      value={numGuests}
      offset="1"
      _0={`${host} does not give a party.`}
      _1={`${host} invites ${guest} to her party.`}
      _2={`${host} invites ${guest} and one other person to her party.`}
      other={`${host} invites ${guest} and # other people to her party.`}
    />
  }
  male={
    <Plural
      value={numGuests}
      offset="1"
      _0={`${host} does not give a party.`}
      _1={`${host} invites ${guest} to his party.`}
      _2={`${host} invites ${guest} and one other person to his party.`}
      other={`${host} invites ${guest} and # other people to his party.`}
    />
  }
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
/>
