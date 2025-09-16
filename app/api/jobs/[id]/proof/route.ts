import { NextResponse } from "next/server";
import * as z from "zod";

import { mockIExecClient } from "@/lib/jobs/mockClient";

export const runtime = "nodejs";

export async function GET(_req: Request, context: { params: { id: string } }) {
  const idSchema = z.object({ id: z.string().min(1) });
  try {
    const { id } = idSchema.parse(context.params);
    const proofHash = await mockIExecClient.fetchProof(id);
    return NextResponse.json({ proofHash });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("not ready")) {
      return NextResponse.json({ status: "pending" }, { status: 202 });
    }
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

