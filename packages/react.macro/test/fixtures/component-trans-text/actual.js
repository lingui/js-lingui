import { Trans } from '@lingui/react.macro';

<span>Without translation</span>;
<Trans>Hello World</Trans>;
<Trans id="Hello World">Hello World</Trans>;
<Trans id="msg.hello">Hello World</Trans>;
<Trans id={msg} />;
