import * as React from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none h-9 px-4";
    const variants: Record<NonNullable<Props["variant"]>, string> = {
      primary: "bg-primary text-black hover:bg-primary/90",
      secondary: "bg-[#1a1a1e] text-fg hover:bg-[#202026] border border-border",
      outline: "border border-border hover:bg-[#16161A]",
      ghost: "hover:bg-[#16161A] text-fg"
    };
    return <button ref={ref} className={clsx(base, variants[variant], className)} {...props} />;
  }
);
Button.displayName = "Button";

