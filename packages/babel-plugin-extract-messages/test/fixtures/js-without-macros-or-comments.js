const msg = i18n._('Message')

const withDescription = i18n._('Description', {}, { comment: "description"});

const withMultilineComment = i18n._('Multiline', {}, { comment: "this is " + "2 lines long" });

const withId = i18n._('ID', {}, { message: 'Message with id' });

const withValues = i18n._('Values {param}', { param: param });

const withContext = i18n._('Some id', {},{ context: 'Context1'});
