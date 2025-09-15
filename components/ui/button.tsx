import clsx from "clsx";
import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus:shadow-focus disabled:opacity-50 disabled:pointer-events-none h-9 px-4";
    const variants: Record<NonNullable<Props["variant"]>, string> = {
      primary: "bg-primary text-bg hover:bg-primary/90",
      secondary: "bg-elev text-fg hover:bg-elev/90 border border-border",
      outline: "border border-border hover:bg-elev/60 text-fg",
      ghost: "hover:bg-elev/60 text-fg"
    };
    return <button ref={ref} className={clsx(base, variants[variant], className)} {...props} />;
  }
);
Button.displayName = "Button";

