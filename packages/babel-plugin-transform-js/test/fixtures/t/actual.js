i18n._(message);
const a = i18n.t`Hello World`;
i18n.t`My name is ${name}`;
i18n.t`${duplicate} variable ${duplicate}`;
i18n.t`
  Remove any newlines...
  
  and replace them with one space.
`;
i18n.t`
  Property ${props.name},
  function ${random()},
  array ${array[index]},
  constant ${42},
  object ${new Date()}
  everything ${props.messages[index].value()}
`
i18n.t('id')`Hello World`
i18n.t('id')`Hello ${name}`
