import { t } from '@lingui/js.macro'
const i18n = setupI18n();
const a = t`Hello World`;
t`My name is ${name}`;
t`${duplicate} variable ${duplicate}`;
t`
  Remove any newlines...
  
  and replace them with one space.
`;
t`
  Property ${props.name},
  function ${random()},
  array ${array[index]},
  constant ${42},
  object ${new Date()}
  everything ${props.messages[index].value()}
`
t('id')`Hello World`
t('id')`Hello ${name}`
