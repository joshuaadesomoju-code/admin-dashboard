import { useState } from "react";

// Card with a title and a "Table" toggle so every chart value is readable without hovering.
export default function ChartCard({ title, subtitle, table, children }) {
  const [asTable, setAsTable] = useState(false);
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm" style={{ color: "var(--ink-2)" }}>{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          className="shrink-0 rounded-md px-2.5 py-1 text-sm"
          style={{ border: "1px solid var(--ring)", color: "var(--ink-2)" }}
          aria-pressed={asTable}
        >
          {asTable ? "Chart" : "Table"}
        </button>
      </div>
      {asTable ? table : children}
    </section>
  );
}

export function DataTable({ columns, rows }) {
  return (
    <div className="max-h-96 overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ color: "var(--muted)" }}>
            {columns.map((c) => (
              <th key={c.key} className={`pb-2 font-medium ${c.align === "right" ? "text-right" : "text-left"}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: "1px solid var(--grid)" }}>
              {columns.map((c) => (
                <td key={c.key} className={`py-1.5 ${c.align === "right" ? "tnum text-right" : ""}`}>{r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
