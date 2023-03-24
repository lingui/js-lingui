
const msg = i18n._('Message')

const withDescription = i18n._('Description', {}, { comment: "description"});

const withId = i18n._('ID', {}, { message: 'Message with id' });

const withValues = i18n._('Values {param}', { param: param });

const withContext = i18n._('Some id', {},{ context: 'Context1'});

const withTMessageDescriptor = i18n.t({ id: 'my.id', message: 'My Id Message', comment: 'My comment'});