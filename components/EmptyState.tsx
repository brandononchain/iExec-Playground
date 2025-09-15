import clsx from "clsx";
import * as React from "react";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center text-center gap-3 p-8 border border-border rounded-md bg-elev",
        className
      )}
    >
      {icon && <div className="text-primary">{icon}</div>}
      <div className="font-medium">{title}</div>
      {description && <div className="text-sm text-muted max-w-prose">{description}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

