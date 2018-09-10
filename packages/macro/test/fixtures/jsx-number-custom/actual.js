import { Trans, NumberFormat } from '@lingui/macro';

<Trans>The answer is <NumberFormat value={value} format={currency} /></Trans>;
<Trans>The answer is <NumberFormat value={value} format={{
  minimumFractionDigits: 2
}} /></Trans>;
<Trans>First <NumberFormat value={one} format={{
  minimumFractionDigits: 2
}} /> and second <NumberFormat value={two} format={{
  minimumFractionDigits: 4
}} /></Trans>;
<Trans>First <NumberFormat value={one} format={{
  minimumFractionDigits: 2
}} /> and second <Nested><NumberFormat value={two} format={{
  minimumFractionDigits: 4
}} /></Nested></Trans>;
