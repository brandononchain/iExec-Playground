import clsx from "clsx";
import * as React from "react";

type LabelProps = React.HTMLAttributes<HTMLDivElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <div
      className={clsx(
        "uppercase tracking-wider text-overline text-muted",
        className
      )}
      {...props}
    />
  );
}

