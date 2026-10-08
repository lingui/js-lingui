import React from "react";
import type { ReactNode } from "react";
import cx from "clsx";

const WIDTHS = {
  narrow: "max-w-3xl",
  default: "max-w-4xl",
  wide: "max-w-6xl",
} as const;

type SectionProps = {
  title?: string;
  /** One or two sentences under the title. */
  intro?: ReactNode;
  width?: keyof typeof WIDTHS;
  className?: string;
  children: ReactNode;
};

/** Homepage section: shared vertical rhythm, container width and heading block. */
export function Section({ title, intro, width = "wide", className, children }: SectionProps): React.ReactElement {
  return (
    <section className={cx("px-4 py-20 sm:px-6 sm:py-32", className)}>
      <div className={cx("mx-auto", WIDTHS[width])}>
        {title && (
          <div className="mb-12 text-center">
            <h2 className="m-0 text-balance text-3xl font-semibold text-heading sm:text-4xl">{title}</h2>
            {intro && <p className="mx-auto mb-0 mt-4 max-w-xl text-base leading-relaxed text-body-fg">{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
