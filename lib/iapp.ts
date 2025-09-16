import type { RunConfig, Job } from "./jobs/types";

/**
 * Build an iApp manifest JSON for Builder deploy flow.
 * Currently returns placeholder keys; shape may evolve with Builder API.
 */
export function makeIAppManifest(runConfig: RunConfig, job: Job) {
  const manifest = {
    version: 1,
    name: "confidential-playground-export",
    description: "Placeholder iApp export generated from a confidential run",
    source: {
      scenario: runConfig.scenario,
      model: runConfig.model,
      resourceClass: runConfig.resourceClass,
      datasetCid: runConfig.datasetCid
    },
    execution: {
      jobId: job.id,
      createdAt: job.createdAt,
      status: job.status,
      proofHash: job.proofHash ?? null,
      resultCid: job.resultCid ?? null
    },
    // Placeholder keys for future Builder deploy integration
    builder: {
      appId: "TODO",
      endpoint: "TODO",
      params: {
        // add concrete params when Builder endpoint is available
      }
    }
  } as const;

  return manifest;
}

