"use client";

import AppShell from "@/components/AppShell";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProofBadge } from "@/components/ProofBadge";
import { useStore } from "@/lib/store";

export default function Page() {
  const runs = useStore((s) => s.runs);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Playground Overview</h2>
        <Link href="/builder/iapps/confidential-playground/new">
          <Button variant="primary">New Confidential Run</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Credits</CardTitle></CardHeader>
          <CardContent>50 RLC free trial</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Completed Runs</CardTitle></CardHeader>
          <CardContent>{runs.filter((r) => r.status === "completed").length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Confidential Proofs</CardTitle></CardHeader>
          <CardContent><ProofBadge /></CardContent>
        </Card>
      </div>

      <h3 className="mt-8 mb-3 font-semibold">Recent Runs</h3>
      <div className="grid gap-3">
        {runs.map((r) => (
          <Card key={r.id}>
            <CardContent className="py-4 flex items-center gap-4">
              <div className="text-sm text-muted w-40">
                {new Date(r.createdAt).toLocaleString()}
              </div>
              <div className="flex-1">
                {r.model} • {r.scenario}
              </div>
              <div className="w-28">{r.status}</div>
              <Link
                href={`/builder/iapps/confidential-playground/run/${r.id}`}
                className="text-primary underline"
              >
                Open
              </Link>
            </CardContent>
          </Card>
        ))}
        {runs.length === 0 && (
          <div className="text-muted text-sm">
            No runs yet — create your first confidential execution.
          </div>
        )}
      </div>
    </AppShell>
  );
}

