import { Trans } from 'lingui-react';

<Trans>Hi, my name is {name}</Trans>;
<Trans>{duplicate} variable {duplicate}</Trans>;
<Trans>
  How much is {expression}? {count}
</Trans>;
<Trans>{`How much is ${expression}? ${count}`}</Trans>;
<Trans>{"hello {count, plural, one {world} other {worlds}}"}</Trans>;
<Trans>
  Property {props.name},
  function {random()},
  array {array[index]},
  constant {42},
  object {new Date()}
  everything {props.messages[index].value()}
</Trans>;
