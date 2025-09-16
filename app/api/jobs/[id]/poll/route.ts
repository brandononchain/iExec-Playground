import { NextResponse } from "next/server";
import * as z from "zod";

import { mockIExecClient } from "@/lib/jobs/mockClient";

export const runtime = "nodejs";

export async function GET(_req: Request, context: { params: { id: string } }) {
  const idSchema = z.object({ id: z.string().min(1) });
  try {
    const { id } = idSchema.parse(context.params);
    const job = await mockIExecClient.poll(id);
    return NextResponse.json(job);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

