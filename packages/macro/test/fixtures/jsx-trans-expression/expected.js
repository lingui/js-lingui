import { Trans } from "@lingui/react";
<Trans id="Hi, my name is {name}" values={{
  name: name
}} />;
<Trans id="{duplicate} variable {duplicate}" values={{
  duplicate: duplicate
}} />;
<Trans id="How much is {expression}? {count}" values={{
  expression: expression,
  count: count
}} />;
<Trans id="How much is {expression}? {count}" values={{
  expression: expression,
  count: count
}} />;
<Trans id="hello {count, plural, one {world} other {worlds}}" />;
<Trans id="Property {0}, function {1}, array {2}, constant {3}, object {4}, everything {5}" values={{
  0: props.name,
  1: random(),
  2: array[index],
  3: 42,
  4: new Date(),
  5: props.messages[index].value()
}} />;
