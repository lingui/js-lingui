const a = i18n._("Expression assignment");

i18n._("Variable {name}", {
  name: name
});

i18n._("{duplicate} variable {duplicate}", {
  duplicate: duplicate
});

i18n._("Property {0}, function {1}, array {2}, constant {3}, object {4} anything {5}", {
  0: props.name,
  1: random(),
  2: array[index],
  3: 42,
  4: new Date(),
  5: props.messages[index].value()
});

i18n._("Multiline\nstring");

i18n._("Multiline with continuation");
