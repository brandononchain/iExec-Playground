// Shared types for job execution and iExec client interactions

export type ResourceClass = 'gpu-small' | 'gpu-standard' | 'gpu-high';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

// Minimal JWK representation to avoid depending on DOM lib types
export type Jwk = Record<string, unknown>;

export interface DataKey {
  jwk: Jwk;
  iv: string;
}

export interface RunConfig {
  scenario: string;
  model: string;
  resourceClass: ResourceClass;
  datasetCid: string;
  // Client-only: used locally to decrypt dataset. Do not send to backend/services.
  dataKey?: DataKey;
  estRlc: number;
  estMins: number;
}

export interface Job {
  id: string;
  status: JobStatus;
  // ISO timestamp string for portability across environments
  createdAt: string;
  proofHash?: string;
  resultCid?: string;
}

export interface EstimateResult {
  rlc: number;
  minutes: number;
}

export interface IExecClient {
  estimate(config: RunConfig): Promise<EstimateResult>;
  submit(config: RunConfig): Promise<Job>;
  poll(jobId: string): Promise<Job>;
  fetchProof(jobId: string): Promise<string>;
  fetchResult(jobId: string): Promise<string>;
}

