import { type EstimateResult, type IExecClient, type Job, type RunConfig } from "./types";

type InternalJob = Job & {
  progress: number;
  timersScheduled?: boolean;
};

const jobs = new Map<string, InternalJob>();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeUuid(): string {
  // Prefer crypto.randomUUID when available, fallback to a simple pseudo-uuid
  if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
    return (crypto as any).randomUUID();
  }
  const rnd = Math.random().toString(16).slice(2);
  return `job-${Date.now().toString(16)}-${rnd}`;
}

function hashToHex(input: string, length = 64): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let hex = (h >>> 0).toString(16);
  while (hex.length < length) hex = hex + hex; // repeat to reach target length
  return "0x" + hex.slice(0, length);
}

function deriveResultCid(jobId: string): string {
  const base = hashToHex(jobId, 46).replace(/^0x/, "");
  return `bafy${base}`;
}

function scheduleJob(job: InternalJob) {
  if (job.timersScheduled) return;
  job.timersScheduled = true;

  // Deterministic progress and state transitions over ~3s
  setTimeout(() => {
    const j = jobs.get(job.id);
    if (!j) return;
    j.status = "running";
    j.progress = 10;
  }, 400);

  setTimeout(() => {
    const j = jobs.get(job.id);
    if (!j) return;
    j.progress = 28;
  }, 1000);

  setTimeout(() => {
    const j = jobs.get(job.id);
    if (!j) return;
    j.progress = 54;
  }, 1800);

  setTimeout(() => {
    const j = jobs.get(job.id);
    if (!j) return;
    j.progress = 76;
  }, 2400);

  setTimeout(() => {
    const j = jobs.get(job.id);
    if (!j) return;
    j.progress = 92;
  }, 2800);

  setTimeout(() => {
    const j = jobs.get(job.id);
    if (!j) return;
    j.status = "completed";
    j.progress = 100;
    j.proofHash = hashToHex(j.id, 64);
    j.resultCid = deriveResultCid(j.id);
  }, 3200);
}

export class MockIExecClient implements IExecClient {
  async estimate(config: RunConfig): Promise<EstimateResult> {
    await sleep(120);
    return { rlc: config.estRlc, minutes: config.estMins };
  }

  async submit(config: RunConfig): Promise<Job> {
    await sleep(150);
    const id = safeUuid();
    const createdAt = new Date().toISOString();
    const job: InternalJob = {
      id,
      status: "pending",
      createdAt,
      progress: 0
    };
    jobs.set(id, job);
    scheduleJob(job);
    return { id: job.id, status: job.status, createdAt: job.createdAt };
  }

  async poll(jobId: string): Promise<Job> {
    await sleep(80);
    const job = jobs.get(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);
    return {
      id: job.id,
      status: job.status,
      createdAt: job.createdAt,
      proofHash: job.proofHash,
      resultCid: job.resultCid
    };
  }

  async fetchProof(jobId: string): Promise<string> {
    await sleep(50);
    const job = jobs.get(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);
    if (job.status !== "completed" || !job.proofHash) throw new Error("Proof not ready");
    return job.proofHash;
  }

  async fetchResult(jobId: string): Promise<string> {
    await sleep(50);
    const job = jobs.get(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);
    if (job.status !== "completed" || !job.resultCid) throw new Error("Result not ready");
    return job.resultCid;
  }
}

export const mockIExecClient = new MockIExecClient();

