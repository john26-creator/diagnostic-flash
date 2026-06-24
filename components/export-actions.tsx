import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const base = "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition";

export function ExportActions({
  missionId,
  type,
  docx = false
}: {
  missionId: string;
  type: string;
  docx?: boolean;
}) {
  return (
    <>
      <Link
        className={cn(base, "bg-gold text-night shadow-sm hover:bg-gold/85")}
        href={`/api/missions/${missionId}/exports/${type}?format=pdf`}
      >
        <Download className="h-4 w-4" />
        Exporter PDF
      </Link>
      {docx ? (
        <Link
          className={cn(base, "border border-gold/70 bg-white text-night hover:bg-gold/10")}
          href={`/api/missions/${missionId}/exports/${type}?format=docx`}
        >
          <FileText className="h-4 w-4" />
          Exporter Word
        </Link>
      ) : null}
    </>
  );
}
