"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AppShell from "@/components/AppShell";
import { TrustPanel } from "@/components/TrustPanel";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { fetchResults, startRun } from "@/lib/api";
import { useStore } from "@/lib/store";

export default function RunPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const updateRun = useStore((s) => s.updateRun);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    updateRun(id, { status: "running" });
    void (async () => {
      const updates = await startRun(id);
      for (const u of updates) {
        setProgress(u.progress);
        await new Promise((r) => setTimeout(r, 500));
      }
      const { proofHash } = await fetchResults(id);
      updateRun(id, { status: "completed", proofHash });
      router.push(`/builder/iapps/confidential-playground/run/${id}/results`);
    })();
  }, [id, router, updateRun]);

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Running Confidential Job</h2>
          <div className="rounded-md border border-border bg-elev p-6">
            <div className="mb-3 text-sm text-muted">Execution inside TEE GPU</div>
            <Progress value={progress} />
            <div className="mt-2 text-sm">{progress}%</div>
          </div>
          <div className="mt-4">
            <Button variant="ghost" disabled className="text-muted">
              View logs (coming soon)
            </Button>
          </div>
        </div>
        <TrustPanel />
      </div>
    </AppShell>
  );
}

