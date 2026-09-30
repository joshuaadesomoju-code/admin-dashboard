import { useState } from "react";

// Panel with a Chart / Table switch so every value is readable without hovering.
export default function ChartCard({ id, title, subtitle, table, children, aside }) {
  const [view, setView] = useState("chart");
  return (
    <section id={id} className="panel scroll-mt-32 p-4 sm:p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[13px] text-ink-2">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {aside}
          <div className="flex rounded-lg border border-line-strong p-0.5 text-[13px]" role="group" aria-label={`${title} view`}>
            {["chart", "table"].map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`h-7 rounded-md px-2.5 font-medium capitalize transition-colors ${view === v ? "bg-hover text-ink" : "text-muted hover:text-ink"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
      {view === "table" ? table : children}
    </section>
  );
}

export function DataTable({ columns, rows }) {
  return (
    <div className="max-h-[22rem] overflow-auto">
      <table className="w-full text-[13px]">
        <thead className="sticky top-0 bg-panel">
          <tr className="text-muted">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={`border-b border-line pb-2 font-medium ${c.align === "right" ? "text-right" : "text-left"}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {columns.map((c) => (
                <td key={c.key} className={`py-2 ${c.align === "right" ? "tnum text-right" : ""}`}>{r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartSkeleton({ rows = 8 }) {
  return (
    <div className="panel p-5" aria-hidden="true">
      <div className="skeleton h-4 w-40" />
      <div className="skeleton mt-2 h-3 w-28" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-3.5" style={{ width: `${88 - i * 8}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
