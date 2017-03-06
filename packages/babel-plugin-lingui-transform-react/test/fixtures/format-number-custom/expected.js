<Trans id="The answer is {value,number,currency}" params={{
  value: value
}} formats={{
  currency: currency
}} />;
<Trans id="The answer is {value,number,number0}" params={{
  value: value
}} formats={{
  number0: {
    minimumFractionDigits: 2
  }
}} />;
<Trans id="First {one,number,number0} and second {two,number,number1}" params={{
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
<Trans id="First {one,number,number0} and second <0>{two,number,number1}</0>" params={{
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
