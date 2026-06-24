import { StatusBadge } from "@/components/status-badge";

export function PageHeader({
  title,
  description,
  status,
  children
}: {
  title: string;
  description?: string;
  status?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-gold/40 bg-night px-6 py-5 text-white lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          {status ? <StatusBadge value={status} /> : null}
        </div>
        {description ? <p className="max-w-3xl text-sm text-white/75">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
