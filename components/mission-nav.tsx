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

export function MissionNav({
  missionId,
  organizationLocked = false,
  observedLocked = false
}: {
  missionId: string;
  organizationLocked?: boolean;
  observedLocked?: boolean;
}) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-gold/35 bg-white px-4 py-2 shadow-sm">
      {items.map(([label, path]) => {
        const locked = (organizationLocked && path === "organization") || (observedLocked && path === "observed");
        const href = `/app/missions/${missionId}${path ? `/${path}` : ""}`;
        return locked ? (
          <span
            key={label}
            aria-disabled="true"
            title={path === "observed" ? "Validez le modele theorique avant d'acceder a l'observe." : "Validez le besoin avant d'acceder a l'organisation theorique."}
            className="cursor-not-allowed rounded-md px-3 py-2 text-sm font-medium text-slatecopy/55"
          >
            {label}
          </span>
        ) : (
        <Link key={label} className={cn(
          "rounded-md px-3 py-2 text-sm font-medium text-slatecopy hover:bg-gold/10 hover:text-night",
          pathname === href && "bg-night text-white hover:bg-night hover:text-white"
        )} href={href}>
          {label}
        </Link>
        );
      })}
    </nav>
  );
}
