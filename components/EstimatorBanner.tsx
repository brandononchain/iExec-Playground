import { Badge } from "./ui/badge";

export function EstimatorBanner({ rlc, minutes }: { rlc: number; minutes: number }) {
  return (
    <div className="rounded-md border border-border bg-elev p-3 flex items-center gap-3">
      <Badge className="bg-primary text-bg">Estimate</Badge>
      <div className="text-sm text-muted">~ {rlc.toFixed(2)} RLC • {minutes} GPU min</div>
    </div>
  );
}

