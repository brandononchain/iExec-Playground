import { NextResponse } from "next/server";
import * as z from "zod";

import { mockIExecClient } from "@/lib/jobs/mockClient";
import { type RunConfig } from "@/lib/jobs/types";

export const runtime = "nodejs";

const dataKeySchema = z.object({
  jwk: z.record(z.unknown()),
  iv: z.string().min(1)
});

const submitSchema = z.object({
  scenario: z.string().min(1),
  model: z.string().min(1),
  resourceClass: z.enum(["gpu-small", "gpu-standard", "gpu-high"]).default("gpu-small"),
  datasetCid: z.string().min(1),
  dataKey: dataKeySchema.optional()
});

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const input = submitSchema.parse(data);
    const est = deriveEstimate();
    const config: RunConfig = {
      scenario: input.scenario,
      model: input.model,
      resourceClass: input.resourceClass,
      datasetCid: input.datasetCid,
      dataKey: input.dataKey ? { jwk: input.dataKey.jwk, iv: input.dataKey.iv } : undefined,
      estRlc: est.rlc,
      estMins: est.minutes
    };
    const job = await mockIExecClient.submit(config);
    return NextResponse.json(job);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function deriveEstimate(): { rlc: number; minutes: number } {
  return { rlc: 0.5, minutes: 2 };
}

