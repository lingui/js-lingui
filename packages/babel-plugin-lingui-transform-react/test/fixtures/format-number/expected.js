import { Trans, DateFormat, NumberFormat } from 'lingui-react';

<Trans id="The answer is {value,number}" values={{
  value: value
}} />;
<DateFormat value={value} />;
<NumberFormat value={value} />;
<NumberFormat value={value} format="percent" />;
