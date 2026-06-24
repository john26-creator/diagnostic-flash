export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gold/60 bg-white p-8 text-center">
      <h3 className="text-base font-semibold text-night">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slatecopy">{description}</p>
    </div>
  );
}
