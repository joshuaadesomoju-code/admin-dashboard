// One floating tooltip shared by every chart. Values lead, labels follow.
export default function Tooltip({ tip }) {
  if (!tip) return null;
  const left = Math.min(tip.x + 14, window.innerWidth - 220);
  return (
    <div
      role="status"
      className="pointer-events-none fixed z-50 min-w-40 rounded-lg px-3 py-2 text-sm shadow-lg"
      style={{ left, top: tip.y + 14, background: "var(--panel)", border: "1px solid var(--line-strong)" }}
    >
      {tip.rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2">
          {r.color && <span className="inline-block h-0.5 w-3" style={{ background: r.color }} />}
          <strong className="tnum" style={{ color: "var(--ink)" }}>{r.value}</strong>
          <span style={{ color: "var(--ink-2)" }}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}
