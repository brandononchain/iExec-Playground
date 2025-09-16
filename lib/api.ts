import { Run } from "./store";
import { type IExecClient, type RunConfig } from "./jobs/types";
import { MockIExecClient } from "./jobs/mockClient";

const envUseMock = (globalThis as any)?.process?.env?.NEXT_PUBLIC_USE_MOCK ?? "true";
const USE_MOCK = envUseMock !== "false";

let _client: IExecClient | undefined;
function getClient(): IExecClient {
  if (_client) return _client;
  // For now we only have a mock client; real client can be wired later.
  _client = USE_MOCK ? new MockIExecClient() : new MockIExecClient();
  return _client;
}

export async function createRun(
  payload: Omit<Run, "id" | "createdAt" | "status">
): Promise<Run> {
  const client = getClient();
  const config: RunConfig = {
    scenario: payload.scenario,
    model: payload.model,
    resourceClass: "gpu-small",
    datasetCid: "mock-dataset",
    estRlc: payload.estimate.rlc,
    estMins: payload.estimate.minutes
  };

  // Submit a job to obtain a concrete id; keep UI run record as pending.
  const job = await client.submit(config);
  return {
    ...payload,
    id: job.id,
    createdAt: Date.now(),
    status: "pending"
  };
}

export async function startRun(_id: string): Promise<{ progress: number }[]> {
  // UI expects deterministic progress ticks; the mock client transitions in ~3.2s.
  const updates = [10, 28, 54, 76, 92, 100];
  return updates.map((p) => ({ progress: p }));
}

export async function fetchResults(id: string): Promise<{ proofHash: string }> {
  const client = getClient();
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const proofHash = await client.fetchProof(id);
      return { proofHash };
    } catch (err) {
      // Proof not ready yet; keep polling
    }
    await wait(250);
  }
  // Final attempt; let it throw if still unavailable
  const proofHash = await client.fetchProof(id);
  return { proofHash };
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

