i18n._(message);

const a = i18n._("Hello World");

i18n._("My name is {name}", {
  name: name
});

i18n._("{duplicate} variable {duplicate}", {
  duplicate: duplicate
});

i18n._("Remove any newlines... and replace them with one space.");

i18n._("Property {0}, function {1}, array {2}, constant {3}, object {4} everything {5}", {
  0: props.name,
  1: random(),
  2: array[index],
  3: 42,
  4: new Date(),
  5: props.messages[index].value()
});
