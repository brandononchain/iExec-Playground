"use client";

import useSWR from "swr";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import type { RunStatus } from "@/lib/store";
import { useStore } from "@/lib/store";

type JobPollResponse = {
  id: string;
  status: RunStatus;
  createdAt: string;
  proofHash?: string;
  resultCid?: string;
};

async function jsonFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

async function fetchWithRetry<T = unknown>(
  url: string,
  opts?: { attempts?: number; intervalMs?: number }
): Promise<T> {
  const attempts = opts?.attempts ?? 60;
  const intervalMs = opts?.intervalMs ?? 500;
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) return (await res.json()) as T;
    // 202 indicates still processing; continue retrying
    if (res.status !== 202) {
      const text = await res.text();
      throw new Error(text || `Request failed: ${res.status}`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

export function useJobPolling(jobId?: string) {
  const updateRun = useStore((s) => s.updateRun);
  const lastStatusRef = useRef<RunStatus | undefined>(undefined);

  const { data, error, isLoading } = useSWR<JobPollResponse>(
    jobId ? `/api/jobs/${jobId}/poll` : null,
    jsonFetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: (latest: JobPollResponse | undefined) => {
        if (!latest) return 2000;
        return latest.status === "completed" || latest.status === "failed" ? 0 : 2000;
      }
    }
  );

  const status: RunStatus | undefined = data?.status;

  useEffect(() => {
    if (error) {
      toast.error("Polling error", { description: String(error) });
    }
  }, [error]);

  // Provide a user-friendly progress approximation in absence of server-side progress
  const [progress, setProgress] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedHandledRef = useRef<boolean>(false);

  useEffect(() => {
    if (!status) return;
    const prev = lastStatusRef.current;
    if (status !== prev) {
      if (status === "pending") toast.info("Run queued", { duration: 1500 });
      if (status === "running") toast("Run started", { description: "Your confidential job is executing" });
      if (status === "completed") toast.success("Run completed");
      if (status === "failed") toast.error("Run failed");
      lastStatusRef.current = status;
    }

    // Keep store's status in sync for the run
    if (jobId) updateRun(jobId, { status });

    if (status === "pending") {
      setProgress(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (status === "running") {
      if (timerRef.current) return; // already ticking
      timerRef.current = setInterval(() => {
        setProgress((p: number) => {
          const next = p + 3 + Math.random() * 4; // 3-7% per tick
          return Math.min(95, Math.floor(next));
        });
      }, 500);
      return;
    }

    // Terminal states
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (status === "completed") {
      setProgress(100);
    }
  }, [jobId, status, updateRun]);

  // On completion, fetch proof and result and update store
  useEffect(() => {
    if (!jobId || status !== "completed") return;
    if (completedHandledRef.current) return;
    completedHandledRef.current = true;

    void (async () => {
      try {
        const [{ proofHash }, { resultCid }] = await Promise.all([
          fetchWithRetry<{ proofHash: string }>(`/api/jobs/${jobId}/proof`),
          fetchWithRetry<{ resultCid: string }>(`/api/jobs/${jobId}/result`)
        ]);
        updateRun(jobId, { proofHash, resultCid });
      } catch (_err) {
        // Best-effort; do not throw within effect
      }
    })();
  }, [jobId, status, updateRun]);

  const value = useMemo(
    () => ({
      status,
      progress,
      isLoading,
      isError: Boolean(error)
    }),
    [status, progress, isLoading, error]
  );

  return value;
}

export type UseJobPollingReturn = ReturnType<typeof useJobPolling>;

