import { Trans } from "@lingui/react"
;<Trans
  id={"n0a/bN"}
  message={
    "{genderOfHost, select, female {{numGuests, plural, offset:1 =0 {{host} does not give a party.} =1 {{host} invites {guest} to her party.} =2 {{host} invites {guest} and one other person to her party.} other {{host} invites {guest} and # other people to her party.}}} male {{numGuests, plural, offset:1 =0 {{host} does not give a party.} =1 {{host} invites {guest} to his party.} =2 {{host} invites {guest} and one other person to his party.} other {{host} invites {guest} and # other people to his party.}}} other {{numGuests, plural, offset:1 =0 {{host} does not give a party.} =1 {{host} invites {guest} to their party.} =2 {{host} invites {guest} and one other person to their party.} other {{host} invites {guest} and # other people to their party.}}}}"
  }
  values={{
    genderOfHost: genderOfHost,
    numGuests: numGuests,
    host: host,
    guest: guest,
  }}
/>
