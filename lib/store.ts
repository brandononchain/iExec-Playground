import { create } from "zustand";

export type Scenario = "healthcare" | "finance" | "web3" | "custom";
export type RunStatus = "pending" | "running" | "completed" | "failed";

export interface Run {
  id: string;
  scenario: Scenario;
  model: string;
  createdAt: number;
  status: RunStatus;
  estimate: { rlc: number; minutes: number };
  proofHash?: string;
  resultCid?: string;
}

export interface RunDraft {
  cid: string;
  iv: string; // base64 IV
  keyJwk: JsonWebKey;
  name?: string; // original filename (for preview hints)
}

type State = {
  credits: number;
  runs: Run[];
  addRun: (r: Run) => void;
  updateRun: (id: string, patch: Partial<Run>) => void;
  runDraft?: RunDraft;
  setRunDraft: (draft?: RunDraft) => void;
};

export const useStore = create<State>((set) => ({
  credits: 50,
  runs: [],
  addRun: (r) => set((s) => ({ runs: [r, ...s.runs] })),
  updateRun: (id, patch) =>
    set((s) => ({
      runs: s.runs.map((x) => (x.id === id ? { ...x, ...patch } : x))
    })),
  setRunDraft: (draft) => set(() => ({ runDraft: draft }))
}));

