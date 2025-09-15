import { ReactNode } from "react";

import { SideNav } from "./SideNav";
import { Topbar } from "./Topbar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <SideNav />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

