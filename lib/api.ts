import { Run } from "./store";

export async function createRun(
  payload: Omit<Run, "id" | "createdAt" | "status">
): Promise<Run> {
  await wait(300);
  return {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    status: "pending"
  };
}

export async function startRun(_id: string): Promise<{ progress: number }[]> {
  const updates = [10, 28, 54, 76, 92, 100];
  return updates.map((p) => ({ progress: p }));
}

export async function fetchResults(_id: string): Promise<{ proofHash: string }> {
  await wait(400);
  return {
    proofHash:
      "0x" + Math.random().toString(16).slice(2).padEnd(64, "0")
  };
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

