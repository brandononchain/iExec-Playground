
import * as React from "react";
import clsx from "clsx";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        className
      )}
      {...props}
    />
  );
}
