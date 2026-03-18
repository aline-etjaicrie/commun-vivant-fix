export default function UserStatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-[#6B7280]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#1B2D3E]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#6B7280]">{hint}</p> : null}
    </article>
  );
}
