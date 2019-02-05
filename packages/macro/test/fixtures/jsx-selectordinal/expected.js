import { Trans } from "@lingui/core";
<Trans id="This is my {count, selectordinal, one {#st} two {#nd} other {<0>#rd</0>}} cat." values={{
  count: count
}} components={{
  0: <strong />
}} />;
<Trans id="This is my {0, selectordinal, one {#st} two {#nd} other {<0>#rd</0>}} cat." values={{
  0: user.numCats
}} components={{
  0: <strong />
}} />;
