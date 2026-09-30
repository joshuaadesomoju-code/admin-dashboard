import { useMemo, useState } from "react";
import { money } from "../api";

export default function OrdersTable({ orders }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "total", dir: "desc" });
  const [page, setPage] = useState(0);
  const perPage = 8;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = orders.filter((o) => !q || o.customer.toLowerCase().includes(q) || String(o.id) === q);
    const mult = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => (a[sort.key] > b[sort.key] ? mult : a[sort.key] < b[sort.key] ? -mult : 0));
  }, [orders, query, sort]);

  const pages = Math.max(Math.ceil(rows.length / perPage), 1);
  const current = Math.min(page, pages - 1);
  const visible = rows.slice(current * perPage, current * perPage + perPage);

  const header = (key, label, right) => {
    const active = sort.key === key;
    return (
      <th className={`pb-2 font-medium ${right ? "text-right" : "text-left"}`}>
        <button
          type="button"
          onClick={() => setSort({ key, dir: active && sort.dir === "desc" ? "asc" : "desc" })}
          style={{ color: active ? "var(--ink)" : "var(--muted)" }}
        >
          {label} {active ? (sort.dir === "desc" ? "↓" : "↑") : ""}
        </button>
      </th>
    );
  };

  return (
    <section className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Orders</h2>
          <p className="mt-0.5 text-sm" style={{ color: "var(--ink-2)" }}>{rows.length} orders match</p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
          placeholder="Search customer or order #"
          className="w-64 max-w-full rounded-md px-3 py-1.5 text-sm"
          style={{ border: "1px solid var(--ring)", background: "var(--page)" }}
          aria-label="Search orders"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {header("id", "Order")}
              {header("customer", "Customer")}
              {header("items", "Items", true)}
              {header("total", "Total", true)}
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => (
              <tr key={o.id} style={{ borderTop: "1px solid var(--grid)" }}>
                <td className="tnum py-2" style={{ color: "var(--ink-2)" }}>#{o.id}</td>
                <td className="py-2">{o.customer}</td>
                <td className="tnum py-2 text-right">{o.items}</td>
                <td className="tnum py-2 text-right font-medium">{money.format(o.total)}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={4} className="py-6 text-center" style={{ color: "var(--muted)" }}>No orders match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-sm" style={{ color: "var(--ink-2)" }}>
        <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} className="rounded-md px-2.5 py-1 disabled:opacity-40" style={{ border: "1px solid var(--ring)" }}>Previous</button>
        <span className="tnum">Page {current + 1} of {pages}</span>
        <button type="button" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="rounded-md px-2.5 py-1 disabled:opacity-40" style={{ border: "1px solid var(--ring)" }}>Next</button>
      </div>
    </section>
  );
}
