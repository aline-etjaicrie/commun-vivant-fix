interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-[#D8DEE5] bg-white p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-[#6B7A89]">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[#13212E]">{value}</p>
      {hint ? <p className="mt-2 text-sm text-[#5A6B7B]">{hint}</p> : null}
    </article>
  );
}
