
"use client";

import clsx from "clsx";
import { Lock, SquareGanttChart, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/builder/iapps", label: "My iApps", icon: SquareGanttChart },
  { href: "/builder/iapps/confidential-playground", label: "Confidential AI Playground", icon: Lock }
];

export function SideNav() {
  const pathname = usePathname();
  return (
    <aside className="w-[260px] bg-elev border-r border-border hidden md:flex flex-col">
      <div className="h-16 px-4 flex items-center gap-2">
        <div className="size-8 rounded-full bg-primary" />
        <span className="font-semibold">iExec Builder</span>
      </div>
      <nav className="px-2 py-4 space-y-1">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-elev transition",
              pathname?.startsWith(href) && "bg-elev text-fg"
            )}
          >
            <Icon className="size-4 text-primary" />
            <span>{label}</span>
            {pathname?.startsWith(href) && <ChevronRight className="ml-auto size-4 text-muted" />}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
