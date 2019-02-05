import { Trans } from "@lingui/core";
<Trans id="Hello <0>World!</0><1/><2>My name is <3> <4>{name}</4></3></2>" values={{
  name: name
}} components={{
  0: <strong />,
  1: <br />,
  2: <p />,
  3: <a href="/about" />,
  4: <em />
}} />;
<Trans id="<0>Component inside expression container</0>" components={{
  0: <span />
}} />;
<Trans id="<0/>" components={{
  0: <br />
}} />;
