import type { CanonicalRole, ExtractionIAKind, ExtractionIAStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/form";
import { confirmExtractionItemAction, deleteExtractionItemAction, rejectExtractionItemAction, runTheoreticalExtractionAction } from "@/lib/actions/actions";
import { cn } from "@/lib/utils";

type ExtractionItemView = {
  id: string;
  kind: ExtractionIAKind;
  label: string;
  detail: string | null;
  detectedRole: string | null;
  detectedActivity: string | null;
  workflowOrder: number | null;
  confidence: number;
  status: ExtractionIAStatus;
  correction: string | null;
  mappedCanonicalRole: CanonicalRole | null;
};

const canonicalRoles: CanonicalRole[] = ["SPONSOR", "PM", "PO", "RTE", "ARCHITECT", "SCRUM_MASTER", "BA", "DEV", "QA", "MANAGER", "OTHER"];

export function AIExtractionSection({ missionId, items }: { missionId: string; items: ExtractionItemView[] }) {
  const ambiguities = items.filter((item) => item.kind === "AMBIGUITY");
  const questions = items.filter((item) => item.kind === "QUESTION");
  const detectedCount = items.filter((item) => item.status === "DETECTED").length;
  const confirmedCount = items.filter((item) => item.status === "CONFIRMED").length;
  const rejectedCount = items.filter((item) => item.status === "REJECTED").length;

  return (
    <Card className="xl:col-span-2 overflow-hidden">
      <CardHeader className="bg-night text-white">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-white">Extraction IA</CardTitle>
            <p className="mt-2 text-sm text-white/70">Extraction mockee : propositions a confirmer, corriger, remapper ou rejeter par le consultant.</p>
          </div>
          <form action={runTheoreticalExtractionAction.bind(null, missionId)}>
            <Button type="submit" className="bg-gold text-night hover:bg-gold/85">Lancer extraction IA mockee</Button>
          </form>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        {!items.length ? (
          <div className="rounded-lg border border-dashed border-gold/60 bg-ivory p-6 text-sm text-slatecopy">
            Aucune extraction lancee. Importez ou declarez des sources, puis lancez l'extraction IA mockee.
          </div>
        ) : null}

        {items.length ? (
          <div className="grid gap-3 md:grid-cols-3">
            <Metric label="Propositions detectees" value={detectedCount} />
            <Metric label="Propositions confirmees" value={confirmedCount} />
            <Metric label="Propositions rejetees" value={rejectedCount} />
          </div>
        ) : null}

        <section className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-night">Ambiguites detectees</h3>
            {ambiguities.map((item) => <ExtractionCard key={item.id} missionId={missionId} item={item} correctionLabel="Correction" />)}
            {!ambiguities.length ? <EmptyLine /> : null}
          </div>
          <div className="grid gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-night">Questions IA</h3>
            {questions.map((item) => <ExtractionCard key={item.id} missionId={missionId} item={item} correctionLabel="Reponse ou reformulation" />)}
            {!questions.length ? <EmptyLine /> : null}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gold/35 bg-white p-4">
      <div className="text-2xl font-semibold text-night">{value}</div>
      <div className="text-sm text-slatecopy">{label}</div>
    </div>
  );
}

function ExtractionCard({
  missionId,
  item,
  correctionLabel,
  showRoleMapping = false
}: {
  missionId: string;
  item: ExtractionItemView;
  correctionLabel: string;
  showRoleMapping?: boolean;
}) {
  return (
    <div className={cn("rounded-lg border bg-white p-4", item.status === "REJECTED" ? "border-slatecopy/20 opacity-70" : "border-gold/35")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-night">{displayValue(item)}</div>
          {item.detail ? <p className="mt-1 text-sm text-slatecopy">{item.detail}</p> : null}
        </div>
        <StatusPill status={item.status} />
      </div>
      <div className="mt-2 text-xs text-slatecopy">Confiance : {Math.round(item.confidence * 100)} %</div>
      <ValidationForm missionId={missionId} item={item} correctionLabel={correctionLabel} showRoleMapping={showRoleMapping} />
    </div>
  );
}

function ValidationForm({
  missionId,
  item,
  correctionLabel,
  showRoleMapping = false,
  compact = false
}: {
  missionId: string;
  item: ExtractionItemView;
  correctionLabel: string;
  showRoleMapping?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="mt-3 grid gap-2">
      <form action={confirmExtractionItemAction.bind(null, missionId, item.id)} className="grid gap-2">
        <Field label={correctionLabel}>
          <input name="correction" className={inputClass} defaultValue={item.correction ?? ""} placeholder={item.label} />
        </Field>
        {showRoleMapping ? (
          <Field label="Mapping SAFe">
            <select name="mappedCanonicalRole" className={inputClass} defaultValue={item.mappedCanonicalRole ?? "OTHER"}>
              {canonicalRoles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </Field>
        ) : null}
        <Button type="submit" variant="secondary" className={compact ? "w-full px-2" : undefined}>
          {item.status === "CONFIRMED" ? "Mettre a jour" : "Conserver"}
        </Button>
      </form>
      <div className="flex gap-2">
        <form action={rejectExtractionItemAction.bind(null, missionId, item.id)} className="flex-1">
          <Button type="submit" variant="ghost" className="w-full">Rejeter</Button>
        </form>
        <form action={deleteExtractionItemAction.bind(null, missionId, item.id)} className="flex-1">
          <Button type="submit" variant="danger" className="w-full">Supprimer</Button>
        </form>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ExtractionIAStatus }) {
  const label = {
    DETECTED: "Detecte",
    CONFIRMED: "Confirme",
    REJECTED: "Rejete"
  }[status];
  return <span className="inline-flex rounded-full border border-gold/50 bg-gold/10 px-2 py-1 text-xs font-semibold text-night">{label}</span>;
}

function EmptyLine() {
  return <p className="rounded-lg border border-dashed border-gold/50 bg-ivory p-4 text-sm text-slatecopy">Aucune proposition.</p>;
}

function displayValue(item: ExtractionItemView) {
  return item.correction?.trim() || item.label;
}
