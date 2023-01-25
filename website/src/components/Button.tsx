import React from 'react';
import Link from '@docusaurus/Link';

type ButtonProps = {
  href: string;
  children: string;
  isOutline?: boolean;
};

const Button = (props: ButtonProps): React.ReactElement => {
  return (
    <Link
      className={`button button--lg button--primary margin-horiz--sm ${props.isOutline ? 'button--outline' : ''}`}
      to={props.href}
    >
      {props.children}
    </Link>
  );
};

export default Button;
