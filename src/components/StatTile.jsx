export default function StatTile({ label, value, note }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-sm" style={{ color: "var(--ink-2)" }}>{label}</p>
      <p className="mt-2 text-2xl font-semibold sm:text-3xl tracking-tight">{value}</p>
      {note && <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{note}</p>}
    </div>
  );
}
