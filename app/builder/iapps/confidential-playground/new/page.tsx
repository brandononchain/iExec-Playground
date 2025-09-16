"use client";
/* eslint import/order: off */

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";

import AppShell from "@/components/AppShell";
import { EstimatorBanner } from "@/components/EstimatorBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { encryptFile } from "@/lib/crypto";
import { getGatewayUrl, putEncryptedBlob } from "@/lib/storage";
import { useStore, type Scenario } from "@/lib/store";
import type { ResourceClass } from "@/lib/jobs/types";

const scenarios: { key: Scenario; title: string; desc: string }[] = [
  { key: "healthcare", title: "Healthcare", desc: "Private medical image classifier" },
  { key: "finance", title: "Finance", desc: "Risk model on private trades" },
  { key: "web3", title: "Web3", desc: "Agent on encrypted on-chain data" },
  { key: "custom", title: "Custom", desc: "Bring your own model & data" }
];

export default function NewRun() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [scenario, setScenario] = useState<Scenario>("healthcare");
  const [model, setModel] = useState("resnet50.onnx");
  const [resourceClass, setResourceClass] = useState<ResourceClass>("gpu-small");
  const addRun = useStore((s) => s.addRun);
  const setRunDraft = useStore((s) => s.setRunDraft);
  const runDraft = useStore((s) => s.runDraft);
  const router = useRouter();
  const [estimate, setEstimate] = useState<{ rlc: number; minutes: number }>({ rlc: 0.5, minutes: 2 });

  type UploadState =
    | { kind: "idle" }
    | { kind: "encrypting" }
    | { kind: "uploading" }
    | { kind: "uploaded"; cid: string; name: string };

  const [uploadState, setUploadState] = useState<UploadState>({ kind: "idle" });

  const shortCid = useMemo(() => {
    if (uploadState.kind !== "uploaded") return "";
    const c = uploadState.cid;
    return c.length <= 10 ? c : `${c.slice(0, 6)}…${c.slice(-4)}`;
  }, [uploadState]);

  const copyCid = useCallback(async () => {
    if (uploadState.kind !== "uploaded") return;
    await navigator.clipboard.writeText(uploadState.cid);
  }, [uploadState]);

  async function launch() {
    const body = {
      scenario,
      model,
      resourceClass,
      datasetCid: runDraft?.cid
    };
    const resp = await fetch("/api/jobs/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!resp.ok) throw new Error("Submit failed");
    const job: { id: string; status: string; createdAt: string } = await resp.json();
    addRun({
      id: job.id,
      scenario,
      model,
      createdAt: Date.parse(job.createdAt),
      status: job.status as any,
      estimate
    });
    router.push(`/builder/iapps/confidential-playground/run/${job.id}`);
  }

  const onFileSelected = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadState({ kind: "encrypting" });
      const { cipher, meta } = await encryptFile(file);
      setUploadState({ kind: "uploading" });
      const encName = `${file.name}.enc`;
      const cid = await putEncryptedBlob({ cipher, name: encName });
      setUploadState({ kind: "uploaded", cid, name: encName });
      setRunDraft({ cid, iv: meta.iv, keyJwk: meta.keyJwk });
    } catch (err) {
      console.error(err);
      setUploadState({ kind: "idle" });
    }
  }, [setRunDraft]);

  useEffect(() => {
    if (step !== 2) return;
    const controller = new AbortController();
    const fetchEstimate = async () => {
      try {
        const resp = await fetch("/api/jobs/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario, model, resourceClass }),
          signal: controller.signal
        });
        if (!resp.ok) return;
        const data: { rlc: number; minutes: number } = await resp.json();
        setEstimate(data);
      } catch {
        // ignore
      }
    };
    void fetchEstimate();
    return () => controller.abort();
  }, [step, scenario, model, resourceClass]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">New Confidential Run</h2>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((s) => (
              <button
                key={s.key}
                onClick={() => setScenario(s.key)}
                className={`p-4 rounded-md border ${scenario === s.key ? "border-primary bg-elev" : "border-border bg-elev"} text-left`}
              >
                <div className="font-semibold">{s.title}</div>
                <div className="text-sm text-muted">{s.desc}</div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="font-semibold mb-2">Data</div>
              <input type="file" className="block text-sm" onChange={onFileSelected} />
              <div className="text-xs text-muted mt-2">
                Encrypted client-side → TEE → results only.
              </div>
              <div className="mt-3 text-sm">
                {uploadState.kind === "idle" && <span className="text-muted">Select a file to encrypt & upload</span>}
                {uploadState.kind === "encrypting" && <span>Encrypting…</span>}
                {uploadState.kind === "uploading" && <span>Uploading…</span>}
                {uploadState.kind === "uploaded" && (
                  <div className="flex items-center gap-2">
                    <span>
                      Uploaded • CID: <span className="font-mono">{shortCid}</span>
                    </span>
                    <Button variant="secondary" onClick={copyCid}>
                      Copy
                    </Button>
                    <a
                      className="text-primary underline text-xs"
                      href={getGatewayUrl(uploadState.cid, uploadState.name)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </div>
                )}
              </div>
            </Card>
            <Card className="p-4">
              <div className="font-semibold mb-2">Model</div>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-elev border border-border rounded-md px-3 py-2"
              >
                <option>resnet50.onnx</option>
                <option>bert-base.onnx</option>
                <option>tabular-xgb.bin</option>
              </select>
            </Card>
            <Card className="p-4">
              <div className="font-semibold mb-2">Resource</div>
              <select
                value={resourceClass}
                onChange={(e) => setResourceClass(e.target.value as ResourceClass)}
                className="bg-elev border border-border rounded-md px-3 py-2"
              >
                <option value="gpu-small">GPU Small</option>
                <option value="gpu-standard">GPU Standard</option>
                <option value="gpu-high">GPU High</option>
              </select>
            </Card>
            <EstimatorBanner rlc={estimate.rlc} minutes={estimate.minutes} />
          </div>
        )}

        {step === 3 && (
          <Card className="p-4 space-y-2">
            <div className="font-semibold">Review</div>
            <div className="text-sm text-muted">
              Scenario: <span className="text-fg">{scenario}</span>
            </div>
            <div className="text-sm text-muted">
              Model: <span className="text-fg">{model}</span>
            </div>
            <div className="text-sm text-muted">
              Resource: <span className="text-fg">{resourceClass}</span>
            </div>
            <EstimatorBanner rlc={estimate.rlc} minutes={estimate.minutes} />
          </Card>
        )}

        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <Button variant="secondary" onClick={() => setStep((s: 1 | 2 | 3) => ((s - 1) as 1 | 2 | 3))}>
              Back
            </Button>
          )}
          {step < 3 && (
            <Button variant="primary" onClick={() => setStep((s: 1 | 2 | 3) => ((s + 1) as 1 | 2 | 3))}>
              Continue
            </Button>
          )}
          {step === 3 && (
            <Button variant="primary" onClick={launch}>
              Launch
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

