import { Trans, DateFormat, NumberFormat } from '@lingui/react.macro';

<Trans>The answer is <NumberFormat value={value} /></Trans>;
<DateFormat value={value} />;
<NumberFormat value={value} />;
<NumberFormat value={value} format="percent" />;
