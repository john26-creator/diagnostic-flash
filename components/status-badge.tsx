import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  DRAFT: "bg-night/8 text-night ring-1 ring-night/10",
  NEED_VALIDATED: "bg-gold/20 text-night ring-1 ring-gold/35",
  THEORETICAL_MODEL_READY: "bg-gold/20 text-night ring-1 ring-gold/35",
  DATA_IMPORTED: "bg-night/8 text-night ring-1 ring-night/10",
  OBSERVED_MODEL_READY: "bg-night/8 text-night ring-1 ring-night/10",
  GAPS_IDENTIFIED: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
  INVESTIGATION_READY: "bg-gold/20 text-night ring-1 ring-gold/35",
  SYNTHESIS_READY: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200",
  COMPLETED: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200",
  CRITICAL: "bg-red-100 text-red-900 ring-1 ring-red-200",
  ATTENTION: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
  INFORMATION: "bg-night/8 text-night ring-1 ring-night/10",
  PROPOSED: "bg-night/8 text-night ring-1 ring-night/10",
  RETAINED: "bg-gold/20 text-night ring-1 ring-gold/35",
  TO_INVESTIGATE: "bg-amber-100 text-amber-900 ring-1 ring-amber-200"
};

export function StatusBadge({ value }: { value: string }) {
  return <span className={cn("inline-flex rounded px-2 py-1 text-xs font-semibold", tone[value] ?? "bg-gold/15 text-night ring-1 ring-gold/30")}>{value}</span>;
}
