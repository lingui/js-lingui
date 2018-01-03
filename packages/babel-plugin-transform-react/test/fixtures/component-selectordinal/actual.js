import { Trans, SelectOrdinal } from '@lingui/react';

<Trans>
  This is my <SelectOrdinal
    value={count}
    one="#st"
    two={`#nd`}
    other={<strong>#rd</strong>}
  /> cat.
</Trans>;
<Trans>
  This is my <SelectOrdinal
  value={user.numCats}
  one="#st"
  two={`#nd`}
  other={<strong>#rd</strong>}
/> cat.
</Trans>;
