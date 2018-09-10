const a = /*i18n*/{
  id: 'Expression assignment'
};

( /*i18n*/{
  id: 'Variable {name}',
  values: {
    name: name
  }
});

( /*i18n*/{
  id: '{duplicate} variable {duplicate}',
  values: {
    duplicate: duplicate
  }
});

( /*i18n*/{
  id: 'Property {0}, function {1}, array {2}, constant {3}, object {4} anything {5}',
  values: {
    0: props.name,
    1: random(),
    2: array[index],
    3: 42,
    4: new Date(),
    5: props.messages[index].value()
  }
});
