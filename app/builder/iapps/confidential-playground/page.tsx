"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMemo, useState, useEffect, type ChangeEvent } from "react";

import { EmptyState } from "@/components/EmptyState";
import AppShell from "@/components/AppShell";
import { ProofBadge } from "@/components/ProofBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStore, type Run, type RunStatus, type Scenario } from "@/lib/store";

export default function Page() {
  const runs = useStore((s) => s.runs);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<RunStatus | "">((searchParams.get("status") as RunStatus) ?? "");
  const [scenario, setScenario] = useState<Scenario | "">((searchParams.get("scenario") as Scenario) ?? "");
  const [from, setFrom] = useState<string>(searchParams.get("from") ?? "");
  const [to, setTo] = useState<string>(searchParams.get("to") ?? "");

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value: string) => {
      if (value && value.length > 0) params.set(key, value);
      else params.delete(key);
    };
    setOrDelete("status", status);
    setOrDelete("scenario", scenario);
    setOrDelete("from", from);
    setOrDelete("to", to);
    router.replace(`${pathname}?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, scenario, from, to]);

  const filteredRuns: Run[] = useMemo(() => {
    const fromMs = from ? new Date(from).getTime() : undefined;
    const toMs = to ? new Date(to).getTime() + 24 * 60 * 60 * 1000 - 1 : undefined; // inclusive end date
    return runs.filter((r: Run) => {
      if (status && r.status !== status) return false;
      if (scenario && r.scenario !== scenario) return false;
      if (fromMs !== undefined && r.createdAt < fromMs) return false;
      if (toMs !== undefined && r.createdAt > toMs) return false;
      return true;
    });
  }, [runs, status, scenario, from, to]);

  const totalGpuMinutes = useMemo(
    () => filteredRuns.reduce((acc: number, r: Run) => acc + (r.estimate?.minutes ?? 0), 0),
    [filteredRuns]
  );
  const totalRlc = useMemo(
    () => filteredRuns.reduce((acc: number, r: Run) => acc + (r.estimate?.rlc ?? 0), 0),
    [filteredRuns]
  );
  const successRate = useMemo(() => {
    const completed = filteredRuns.filter((r: Run) => r.status === "completed").length;
    const failed = filteredRuns.filter((r: Run) => r.status === "failed").length;
    const denom = completed + failed;
    if (denom === 0) return 0;
    return Math.round((completed / denom) * 100);
  }, [filteredRuns]);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Playground Overview</h2>
        <Link href="/builder/iapps/confidential-playground/new">
          <Button variant="primary">New Confidential Run</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-1">
              <label className="text-xs text-muted block mb-1">Status</label>
              <select
                className="flex h-9 w-full rounded-md border border-border bg-elev px-3 text-sm outline-none focus:shadow-focus"
                value={status}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setStatus(e.target.value as RunStatus | "")
                }
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="text-xs text-muted block mb-1">Scenario</label>
              <select
                className="flex h-9 w-full rounded-md border border-border bg-elev px-3 text-sm outline-none focus:shadow-focus"
                value={scenario}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setScenario(e.target.value as Scenario | "")
                }
              >
                <option value="">All</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="web3">Web3</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="text-xs text-muted block mb-1">From</label>
              <Input
                type="date"
                value={from}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFrom(e.target.value)}
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs text-muted block mb-1">To</label>
              <Input
                type="date"
                value={to}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTo(e.target.value)}
              />
            </div>
            <div className="md:col-span-1 flex items-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setStatus("");
                  setScenario("");
                  setFrom("");
                  setTo("");
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card>
          <CardHeader><CardTitle>Total GPU min</CardTitle></CardHeader>
          <CardContent>{totalGpuMinutes}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total RLC spent</CardTitle></CardHeader>
          <CardContent>{totalRlc.toFixed(2)} RLC</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Success rate</CardTitle></CardHeader>
          <CardContent>{successRate}%</CardContent>
        </Card>
      </div>

      <h3 className="mt-8 mb-3 font-semibold">Recent Runs</h3>
      <div className="grid gap-3">
        {filteredRuns.map((r: Run) => (
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
          <EmptyState
            title="No runs yet"
            description="Create your first confidential execution to get started."
            action={
              <Link href="/builder/iapps/confidential-playground/new">
                <Button variant="primary">New Confidential Run</Button>
              </Link>
            }
          />
        )}
      </div>
    </AppShell>
  );
}

