import React from "react";
import Link from "@docusaurus/Link";
import cx from "clsx";

type ButtonProps = {
  href: string;
  children: string;
  isOutline?: boolean;
};

export function Button(props: ButtonProps): React.ReactElement {
  return (
    <Link
      className={cx(
        "mx-2 inline-flex min-h-10 min-w-28 items-center justify-center rounded-lg px-6 py-2 text-lg font-semibold no-underline transition-opacity hover:no-underline hover:opacity-90",
        "border-2 border-solid border-primary",
        props.isOutline
          ? "bg-transparent text-primary hover:bg-primary hover:text-white"
          : "border-2 border-solid border-primary bg-primary text-white!"
      )}
      to={props.href}
    >
      {props.children}
    </Link>
  );
}
