"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AppShell from "@/components/AppShell";
import { ProofBadge } from "@/components/ProofBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { getGatewayUrl } from "@/lib/storage";
import { decryptFile, type EncryptionMeta } from "@/lib/crypto";
import { makeIAppManifest } from "@/lib/iapp";
import type { Job, RunConfig } from "@/lib/jobs/types";
import { getDeployUrl } from "@/lib/builder";

type StoredMeta = {
  iv: string;
  keyJwk: JsonWebKey;
  name?: string; // optional original filename to help with preview
};

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const run = useStore((s) => s.runs.find((r) => r.id === id));

  const [encBlob, setEncBlob] = useState<Blob | null>(null);
  const [encBytes, setEncBytes] = useState<number | null>(null);
  const [plainBlob, setPlainBlob] = useState<Blob | null>(null);
  const [plainName, setPlainName] = useState<string | undefined>(undefined);
  const [jsonPreview, setJsonPreview] = useState<unknown | null>(null);
  const [busy, setBusy] = useState<"download" | "decrypt" | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const storedMetaKey = useMemo(() => (id ? `run-meta:${id}` : undefined), [id]);

  const loadStoredMeta = useCallback((): StoredMeta | undefined => {
    if (!storedMetaKey) return undefined;
    try {
      const raw = localStorage.getItem(storedMetaKey);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw) as StoredMeta;
      if (!parsed?.iv || !parsed?.keyJwk) return undefined;
      return parsed;
    } catch {
      return undefined;
    }
  }, [storedMetaKey]);

  const handleDownloadEncrypted = useCallback(async () => {
    if (!run?.resultCid) return;
    setBusy("download");
    try {
      const url = getGatewayUrl(run.resultCid);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch result: ${res.status}`);
      const blob = await res.blob();
      setEncBlob(blob);
      setEncBytes(blob.size);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(null);
    }
  }, [run?.resultCid]);

  const handleDecrypt = useCallback(async () => {
    if (!encBlob) return;
    const sm = loadStoredMeta();
    if (!sm) {
      alert("Decryption metadata not found in localStorage for this run.");
      return;
    }
    setBusy("decrypt");
    try {
      const meta: EncryptionMeta = { alg: "AES-GCM", iv: sm.iv, keyJwk: sm.keyJwk };
      const output = await decryptFile(encBlob, meta);
      setPlainBlob(output);
      setPlainName(sm.name);

      // Best-effort JSON preview if filename hints .json
      setJsonPreview(null);
      const nameLower = (sm.name ?? "").toLowerCase();
      if (nameLower.endsWith(".json")) {
        try {
          const txt = await output.text();
          const data = JSON.parse(txt);
          setJsonPreview(data);
        } catch {
          setJsonPreview(null);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to decrypt. Ensure the key and IV match the ciphertext.");
    } finally {
      setBusy(null);
    }
  }, [encBlob, loadStoredMeta]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2400);
  }, []);

  const handleExportIApp = useCallback(() => {
    if (!run) return;

    const job: Job = {
      id: run.id,
      status: run.status as any,
      createdAt: new Date(run.createdAt).toISOString(),
      proofHash: run.proofHash,
      resultCid: run.resultCid
    };

    const runConfig: RunConfig = {
      scenario: run.scenario,
      model: run.model,
      resourceClass: "gpu-small",
      datasetCid: "TODO",
      estRlc: run.estimate.rlc,
      estMins: run.estimate.minutes
    };

    const manifest = makeIAppManifest(runConfig, job);
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "manifest.json";
    a.click();
    URL.revokeObjectURL(url);

    showToast("TODO: POST to Builder endpoint when available");
  }, [run, showToast]);

  const handleDeployInBuilder = useCallback(() => {
    if (!run) return;

    const job: Job = {
      id: run.id,
      status: run.status as any,
      createdAt: new Date(run.createdAt).toISOString(),
      proofHash: run.proofHash,
      resultCid: run.resultCid
    };

    const runConfig: RunConfig = {
      scenario: run.scenario,
      model: run.model,
      resourceClass: "gpu-small",
      datasetCid: "TODO",
      estRlc: run.estimate.rlc,
      estMins: run.estimate.minutes
    };

    const manifest = makeIAppManifest(runConfig, job);
    const href = getDeployUrl(manifest);
    window.open(href, "_blank", "noopener,noreferrer");
  }, [run]);

  function renderJsonTable(value: unknown) {
    if (!value || typeof value !== "object") return null;
    const obj = value as Record<string, unknown>;
    const entries = Object.entries(obj);
    if (entries.length === 0) return <div className="text-sm text-muted">Empty JSON object</div>;
    return (
      <div className="overflow-x-auto">
        <table className="text-sm w-full">
          <thead>
            <tr className="text-muted">
              <th className="text-left pr-4 py-1">Key</th>
              <th className="text-left py-1">Value</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([k, v]) => (
              <tr key={k} className="border-t border-border/50">
                <td className="pr-4 py-1 align-top font-medium">{k}</td>
                <td className="py-1 align-top break-all">{typeof v === "object" ? JSON.stringify(v) : String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const canDownload = Boolean(run?.resultCid);
  const canDecrypt = Boolean(encBlob);

  // Share link for public proof page
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !id) return "";
    return `${window.location.origin}/p/${id}`;
  }, [id]);

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Results</h2>
        <div className="flex items-center gap-2">
          <ProofBadge />
          <Button
            variant="outline"
            onClick={() => {
              if (!shareUrl) return;
              void navigator.clipboard.writeText(shareUrl);
            }}
          >
            Copy link
          </Button>
          <Button variant="primary" onClick={handleExportIApp}>
            Export as iApp
          </Button>
          <Button variant="secondary" onClick={handleDeployInBuilder}>
            Deploy in Builder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="output" className="mt-4">
        <TabsList>
          <TabsTrigger value="output">Output</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="proof">Confidential Proof</TabsTrigger>
        </TabsList>

        <TabsContent value="output">
          <Card>
            <CardHeader><CardTitle>Model Output</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="text-sm text-muted">Model: {run?.model}</div>
                {canDownload ? (
                  <div className="flex items-center gap-2">
                    <Button size="sm" disabled={busy === "download"} onClick={handleDownloadEncrypted}>
                      {busy === "download" ? "Downloading..." : "Download Encrypted Result"}
                    </Button>
                    <Button size="sm" variant="secondary" disabled={!canDecrypt || busy === "decrypt"} onClick={handleDecrypt}>
                      {busy === "decrypt" ? "Decrypting..." : "Decrypt Locally"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted">Result not available yet.</div>
                )}

                {encBytes != null && (
                  <div className="text-sm">Downloaded {encBytes} bytes (encrypted)</div>
                )}

                {plainBlob && (
                  <div className="text-sm">
                    {plainName?.toLowerCase().endsWith(".json") && jsonPreview
                      ? (
                        <div>
                          <div className="mb-2 font-medium">JSON Preview</div>
                          {renderJsonTable(jsonPreview)}
                        </div>
                      ) : (
                        <div>Decrypted {plainBlob.size} bytes</div>
                      )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader><CardTitle>Execution Logs</CardTitle></CardHeader>
            <CardContent className="text-xs text-muted">
              Coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proof">
          <Card>
            <CardHeader><CardTitle>Proof</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm">
                Hash: <span className="text-primary">{run?.proofHash ?? "—"}</span>
              </div>
              <div className="text-xs text-muted mt-2">Shareable link copies a public view at /p/{id}</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-elev border border-border rounded-md shadow px-3 py-2 text-sm">
          {toast}
        </div>
      )}
    </AppShell>
  );
}

