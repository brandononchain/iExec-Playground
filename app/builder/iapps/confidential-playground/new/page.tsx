"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import AppShell from "@/components/AppShell";
import { EstimatorBanner } from "@/components/EstimatorBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createRun } from "@/lib/api";
import { useStore, type Scenario } from "@/lib/store";

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
  const addRun = useStore((s) => s.addRun);
  const router = useRouter();

  const estimate = { rlc: 0.5, minutes: 2 };

  async function launch() {
    const run = await createRun({ scenario, model, estimate });
    addRun(run);
    router.push(`/builder/iapps/confidential-playground/run/${run.id}`);
  }

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
                className={`p-4 rounded-md border ${scenario === s.key ? "border-primary bg-[#16161A]" : "border-border bg-elev"} text-left`}
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
              <input type="file" className="block text-sm" />
              <div className="text-xs text-muted mt-2">
                Encrypted client-side → TEE → results only.
              </div>
            </Card>
            <Card className="p-4">
              <div className="font-semibold mb-2">Model</div>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-[#16161A] border border-border rounded-md px-3 py-2"
              >
                <option>resnet50.onnx</option>
                <option>bert-base.onnx</option>
                <option>tabular-xgb.bin</option>
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
            <EstimatorBanner rlc={estimate.rlc} minutes={estimate.minutes} />
          </Card>
        )}

        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <Button variant="secondary" onClick={() => setStep((s) => ((s - 1) as any))}>
              Back
            </Button>
          )}
          {step < 3 && (
            <Button variant="primary" onClick={() => setStep((s) => ((s + 1) as any))}>
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

