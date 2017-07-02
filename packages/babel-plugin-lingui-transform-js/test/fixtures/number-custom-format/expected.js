i18n._("Format in variable {name,number,currency}", {
  values: {
    name: name
  },
  formats: {
    currency: currency
  }
});
i18n._("One-off format {name,number,number0}, test format name collision {name,number,number1}", {
  values: {
    name: name
  },
  formats: {
    number0: { digits: 4 },
    number1: { digits: 2 }
  }
});
