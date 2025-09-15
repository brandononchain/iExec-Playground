import { ReactNode } from "react";

import { SideNav } from "./SideNav";
import { Topbar } from "./Topbar";
import dynamic from "next/dynamic";

const ChainGuard = dynamic(() => import("./ChainGuard"), { ssr: false });

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <SideNav />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <ChainGuard />
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

