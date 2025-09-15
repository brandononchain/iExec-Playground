
import clsx from "clsx";
import * as React from "react";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "flex h-9 w-full rounded-md border border-border bg-[#16161A] px-3 text-sm outline-none",
        "focus:shadow-focus",
        className
      )}
      {...props}
    />
  );
}
