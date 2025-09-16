import { type Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProofBadge } from "@/components/ProofBadge";
import { mockIExecClient } from "@/lib/jobs/mockClient";

type Params = { params: { id: string } };

function shorten(hash?: string) {
  if (!hash) return "—";
  return hash.length <= 16 ? hash : `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = params;
  let proofHash: string | undefined;
  try {
    proofHash = await mockIExecClient.fetchProof(id);
  } catch {}

  const title = `Confidential Proof • ${shorten(proofHash)}`;
  const description = proofHash
    ? `Verification proof for run ${id}: ${shorten(proofHash)}`
    : `Verification proof for run ${id} is not available yet.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: "/icons/iexec-dot.svg",
          width: 256,
          height: 256,
          alt: "iExec"
        }
      ]
    }
  };
}

export default async function PublicProofPage({ params }: Params) {
  const { id } = params;
  const job = await mockIExecClient.poll(id);
  let proofHash: string | undefined;
  let verifiedAt: Date | undefined;
  try {
    proofHash = await mockIExecClient.fetchProof(id);
    verifiedAt = new Date();
  } catch {}

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold mb-4">Public Proof</h1>
        <Card>
          <CardHeader>
            <CardTitle>Confidential Verified</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <ProofBadge />
              <span className="text-muted">Status:</span>
              <span>{job.status}</span>
            </div>
            <div>
              <span className="text-muted">Run ID:</span> <span className="font-mono break-all">{job.id}</span>
            </div>
            <div>
              <span className="text-muted">Started:</span> {new Date(job.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="text-muted">Proof Hash:</span> <span className="font-mono break-all">{proofHash ?? "—"}</span>
            </div>
            <div>
              <span className="text-muted">Completed:</span> {verifiedAt ? verifiedAt.toLocaleString() : "—"}
            </div>
            <div className="text-xs text-muted">
              This public page shows verification details only. No datasets, keys, or decrypted results are exposed.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

