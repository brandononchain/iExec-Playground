import { Badge } from "./ui/badge";

export function EstimatorBanner({ rlc, minutes }: { rlc: number; minutes: number }) {
  return (
    <div className="rounded-md border border-border bg-[#16161A] p-3 flex items-center gap-3">
      <Badge className="bg-primary text-black">Estimate</Badge>
      <div className="text-sm text-muted">~ {rlc.toFixed(2)} RLC • {minutes} GPU min</div>
    </div>
  );
}

