import useWidth from "./useWidth";
// Horizontal bar chart, one series. Bars grow from a zero baseline with a rounded tip,
// values are labelled at the bar end, and each whole row is the hover target.
export default function BarChart({ rows, format, onTip }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const rowH = 30;
  const [ref, width] = useWidth();
  const labelW = width < 400 ? 110 : 150;
  const plotW = width - labelW - 70;

  return (
    <div ref={ref}><svg width={width} height={rows.length * rowH} viewBox={`0 0 ${width} ${rows.length * rowH}`} className="block" role="img" aria-label="Bar chart">
      <line x1={labelW} x2={labelW} y1={0} y2={rows.length * rowH} stroke="var(--axis)" />
      {rows.map((r, i) => {
        const w = Math.max((r.value / max) * plotW, 6);
        const y = i * rowH;
        const show = (e) => onTip({ x: e.clientX, y: e.clientY, rows: [{ label: r.label, value: format(r.value), color: "var(--series-1)" }] });
        return (
          <g
            key={r.label}
            tabIndex={0}
            className="group cursor-default outline-none"
            onPointerMove={show}
            onPointerLeave={() => onTip(null)}
            onFocus={(e) => { const b = e.currentTarget.getBoundingClientRect(); show({ clientX: b.left + labelW, clientY: b.top }); }}
            onBlur={() => onTip(null)}
          >
            <rect x={0} y={y} width={width} height={rowH} fill="transparent" />
            <text x={labelW - 10} y={y + rowH / 2} dominantBaseline="middle" textAnchor="end" fontSize="12.5" fill="var(--ink-2)">
              {r.label.length > (labelW < 150 ? 12 : 20) ? r.label.slice(0, labelW < 150 ? 11 : 19) + "…" : r.label}
            </text>
            <path
              d={`M${labelW} ${y + 8} h${w - 4} a4 4 0 0 1 4 4 v${rowH - 24} a4 4 0 0 1 -4 4 h${-(w - 4)} z`}
              fill="var(--series-1)"
              className="transition-opacity group-hover:opacity-80 group-focus:opacity-80"
            />
            <text x={labelW + w + 8} y={y + rowH / 2} dominantBaseline="middle" fontSize="12" fill="var(--muted)" className="tnum">
              {format(r.value)}
            </text>
          </g>
        );
      })}
    </svg></div>
  );
}
