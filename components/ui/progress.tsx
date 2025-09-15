export function Progress({ value = 0, className = "" }: { value?: number; className?: string }) {
  return (
    <div className={`w-full h-2 rounded bg-elev ${className}`}>
      <div
        className="h-2 rounded bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

