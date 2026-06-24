import type { Proof } from "@prisma/client";

export function EvidenceList({ proofs }: { proofs: Pick<Proof, "id" | "type" | "reference" | "description">[] }) {
  if (!proofs.length) {
    return <p className="text-sm font-semibold text-destructive">Observation bloquee : aucune preuve associee.</p>;
  }
  return (
    <ul className="grid gap-2">
      {proofs.map((proof) => (
        <li key={proof.id} className="rounded-md border border-gold/35 bg-white p-3 text-sm">
          <div className="font-semibold text-night">{proof.type} {proof.reference ? `- ${proof.reference}` : ""}</div>
          {proof.description ? <div className="mt-1 text-slatecopy">{proof.description}</div> : null}
        </li>
      ))}
    </ul>
  );
}
