"use client";

import { useParams } from "next/navigation";

import AppShell from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";

export default function PublicProofPage() {
  const { id } = useParams<{ id: string }>();
  const run = useStore((s) => s.runs.find((r) => r.id === id));

  return (
    <AppShell>
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold mb-4">Public Proof</h2>
        <Card>
          <CardHeader>
            <CardTitle>Run Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted">Run ID:</span> <span className="font-mono break-all">{id}</span>
            </div>
            <div>
              <span className="text-muted">Scenario:</span> {run?.scenario ?? "—"}
            </div>
            <div>
              <span className="text-muted">Model:</span> {run?.model ?? "—"}
            </div>
            <div>
              <span className="text-muted">Status:</span> {run?.status ?? "—"}
            </div>
            <div>
              <span className="text-muted">Proof Hash:</span> <span className="font-mono break-all">{run?.proofHash ?? "—"}</span>
            </div>
          </CardContent>
        </Card>
        <div className="mt-3 text-xs text-muted">
          No sensitive data is shown on this page. Results remain encrypted and are not displayed.
        </div>
      </div>
    </AppShell>
  );
}

