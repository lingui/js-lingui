import { Trans } from 'lingui-react';

<Trans id="Hello <0>World!</0><1/><2>My name is <3> <4>{name}</4></3></2>" values={{
  name: name
}} components={[<strong />, <br />, <p />, <a href="/about" />, <em />]} />;
<Trans id="<0>Component inside expression container</0>" components={[<span />]} />;
<Trans id="<0/>" components={[<br />]} />;
