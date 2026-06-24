"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  ["Mission", ""],
  ["Besoin", "need"],
  ["Organisation", "organization"],
  ["Observe", "observed"],
  ["Ecarts", "gaps"],
  ["Observations", "observations"],
  ["Investigation", "investigation"],
  ["Synthese", "synthesis"]
] as const;

export function MissionNav({ missionId }: { missionId: string }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-gold/35 bg-white px-4 py-2 shadow-sm">
      {items.map(([label, path]) => (
        <Link key={label} className={cn(
          "rounded-md px-3 py-2 text-sm font-medium text-slatecopy hover:bg-gold/10 hover:text-night",
          pathname === `/app/missions/${missionId}${path ? `/${path}` : ""}` && "bg-night text-white hover:bg-night hover:text-white"
        )} href={`/app/missions/${missionId}${path ? `/${path}` : ""}`}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
