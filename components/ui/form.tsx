import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  className
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("grid gap-2 text-sm font-medium", className)}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-10 rounded-md border border-gold/45 bg-white px-3 py-2 text-sm text-night outline-none focus:border-gold focus:ring-2 focus:ring-gold/20";
