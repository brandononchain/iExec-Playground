import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function TrustPanel({ proofHash }: { proofHash?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="text-primary" /> Trusted Execution
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted">
        Runs inside a TEE GPU environment. Data stays private; only results leave the enclave.
        {proofHash && (
          <div className="mt-3 text-xs">
            Proof hash: <span className="text-fg">{proofHash}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

