import useWidth from "./useWidth";
// Stacked bars: how many products in each category are in stock, low, or sold out.
// Status colours always come with an icon and a word, never colour alone.
export const STATUS = [
  { key: "in", label: "In stock", icon: "✓", color: "var(--good)" },
  { key: "low", label: "Low (under 10)", icon: "▲", color: "var(--warning)" },
  { key: "out", label: "Sold out", icon: "✕", color: "var(--critical)" },
];

export default function StockChart({ rows, onTip }) {
  const max = Math.max(...rows.map((r) => r.in + r.low + r.out), 1);
  const rowH = 30;
  const [ref, width] = useWidth();
  const labelW = width < 480 ? 110 : 150;
  const plotW = width - labelW - 50;
  const gap = 2;

  return (
    <div ref={ref}>
      <ul className="mb-3 flex flex-wrap gap-4 text-sm" style={{ color: "var(--ink-2)" }}>
        {STATUS.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: s.color }} />
            <span aria-hidden="true">{s.icon}</span> {s.label}
          </li>
        ))}
      </ul>
      <svg width={width} height={rows.length * rowH} viewBox={`0 0 ${width} ${rows.length * rowH}`} className="block" role="img" aria-label="Inventory status by category">
        <line x1={labelW} x2={labelW} y1={0} y2={rows.length * rowH} stroke="var(--axis)" />
        {rows.map((r, i) => {
          const y = i * rowH;
          const total = r.in + r.low + r.out;
          let x = labelW;
          const segs = STATUS.filter((s) => r[s.key] > 0);
          return (
            <g key={r.label}>
              <text x={labelW - 10} y={y + rowH / 2} dominantBaseline="middle" textAnchor="end" fontSize="13" fill="var(--ink-2)">
                {r.label.length > (labelW < 150 ? 12 : 20) ? r.label.slice(0, labelW < 150 ? 11 : 19) + "…" : r.label}
              </text>
              {segs.map((s, j) => {
                const w = Math.max((r[s.key] / max) * plotW - (j < segs.length - 1 ? gap : 0), 3);
                const x0 = x;
                x += w + gap;
                const last = j === segs.length - 1;
                const show = (e) =>
                  onTip({ x: e.clientX, y: e.clientY, rows: [{ label: `${s.label} · ${r.label}`, value: `${r[s.key]} of ${total}`, color: s.color }] });
                return (
                  <g key={s.key} tabIndex={0} className="outline-none" onPointerMove={show} onPointerLeave={() => onTip(null)}
                    onFocus={(e) => { const b = e.currentTarget.getBoundingClientRect(); show({ clientX: b.left, clientY: b.top }); }}
                    onBlur={() => onTip(null)}>
                    <rect x={x0} y={y + 4} width={w + gap} height={rowH - 8} fill="transparent" />
                    <rect x={x0} y={y + 8} width={w} height={rowH - 16} rx={last ? 4 : 0} fill={s.color} className="hover:opacity-80" />
                  </g>
                );
              })}
              <text x={x + 6} y={y + rowH / 2} dominantBaseline="middle" fontSize="12" fill="var(--ink-2)" className="tnum">{total}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
