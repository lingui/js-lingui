import { Trans, NumberFormat } from 'lingui-react';

<Trans id="The answer is {value,number,currency}" values={{
  value: value
}} formats={{
  currency: currency
}} />;
<Trans id="The answer is {value,number,number0}" values={{
  value: value
}} formats={{
  number0: {
    minimumFractionDigits: 2
  }
}} />;
<Trans id="First {one,number,number0} and second {two,number,number1}" values={{
  one: one,
  two: two
}} formats={{
  number0: {
    minimumFractionDigits: 2
  },
  number1: {
    minimumFractionDigits: 4
  }
}} />;
<Trans id="First {one,number,number0} and second <0>{two,number,number1}</0>" values={{
  one: one,
  two: two
}} components={[<Nested />]} formats={{
  number0: {
    minimumFractionDigits: 2
  },
  number1: {
    minimumFractionDigits: 4
  }
}} />;
