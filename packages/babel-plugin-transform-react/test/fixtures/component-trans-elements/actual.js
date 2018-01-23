import { Trans } from '@lingui/react';

<Trans>
  Hello <strong>World!</strong><br />
  <p>
    My name is <a href="/about">{" "}
    <em>{name}</em></a>
  </p>
</Trans>;
<Trans>{<span>Component inside expression container</span>}</Trans>;
<Trans>{<br />}</Trans>;
