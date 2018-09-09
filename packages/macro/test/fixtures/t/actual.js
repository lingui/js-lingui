import { t } from '@lingui/macro'

const a = t`Expression assignment`;

t`Variable ${name}`;

t`${duplicate} variable ${duplicate}`;

t`
  Property ${props.name},
  function ${random()},
  array ${array[index]},
  constant ${42},
  object ${new Date()}
  anything ${props.messages[index].value()}
`
