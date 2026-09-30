import { useMemo, useState } from "react";
import { CaretDown, CaretLeft, CaretRight, CaretUp, MagnifyingGlass, X } from "@phosphor-icons/react";
import { money } from "../api";

const COLUMNS = [
  { key: "id", label: "Order" },
  { key: "customer", label: "Customer" },
  { key: "items", label: "Items", right: true },
  { key: "saved", label: "Discount", right: true, hideSm: true },
  { key: "total", label: "Total", right: true },
];

export default function OrdersTable({ orders }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "total", dir: "desc" });
  const [page, setPage] = useState(0);
  const perPage = 10;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, "");
    const list = orders
      .map((o) => ({ ...o, saved: Math.max((o.listTotal ?? o.total) - o.total, 0) }))
      .filter((o) => !q || o.customer.toLowerCase().includes(q) || String(o.id) === q);
    const mult = sort.dir === "asc" ? 1 : -1;
    return list.sort((a, b) => (a[sort.key] > b[sort.key] ? mult : a[sort.key] < b[sort.key] ? -mult : 0));
  }, [orders, query, sort]);

  const pages = Math.max(Math.ceil(rows.length / perPage), 1);
  const current = Math.min(page, pages - 1);
  const visible = rows.slice(current * perPage, current * perPage + perPage);
  const first = rows.length ? current * perPage + 1 : 0;
  const last = Math.min((current + 1) * perPage, rows.length);

  return (
    <section id="orders" className="panel scroll-mt-32 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5">
        <div>
          <h2 className="text-[15px] font-semibold">Orders</h2>
          <p className="mt-0.5 text-[13px] text-ink-2"><span className="tnum">{rows.length}</span> {rows.length === 1 ? "order" : "orders"}{query && " match your search"}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <MagnifyingGlass size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            name="order-search"
            autoComplete="off"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            placeholder="Search customer or order #"
            className="control w-full pl-8"
            aria-label="Search orders"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-y border-line bg-page/60 text-muted">
              {COLUMNS.map((c) => {
                const active = sort.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                    className={`h-9 px-4 font-medium first:pl-5 last:pr-5 ${c.right ? "text-right" : "text-left"} ${c.hideSm ? "hidden sm:table-cell" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSort({ key: c.key, dir: active && sort.dir === "desc" ? "asc" : "desc" })}
                      className={`inline-flex items-center gap-1 hover:text-ink ${active ? "text-ink" : ""}`}
                    >
                      {c.label}
                      {active ? (sort.dir === "desc" ? <CaretDown size={12} weight="bold" /> : <CaretUp size={12} weight="bold" />) : null}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => (
              <tr key={o.id} className="border-b border-line transition-colors last:border-0 hover:bg-hover">
                <td className="tnum h-11 px-4 pl-5 text-muted">#{o.id}</td>
                <td className="px-4 font-medium">{o.customer}</td>
                <td className="tnum px-4 text-right text-ink-2">{o.items}</td>
                <td className="tnum hidden px-4 text-right text-ink-2 sm:table-cell">{o.saved > 0 ? `−${money.format(o.saved)}` : "-"}</td>
                <td className="tnum px-4 pr-5 text-right font-semibold">{money.format(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="px-5 py-12 text-center">
            <MagnifyingGlass size={28} className="mx-auto text-muted" aria-hidden="true" />
            <p className="mt-3 font-medium">No orders match “{query}”</p>
            <p className="mt-1 text-[13px] text-ink-2">Try a customer's first name or an order number like 42.</p>
            <button type="button" onClick={() => setQuery("")} className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-strong px-3 font-medium hover:bg-hover">
              <X size={13} weight="bold" /> Clear search
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-[13px] text-ink-2 sm:px-5">
        <span className="tnum">{rows.length ? `${first}-${last} of ${rows.length}` : "No results"}</span>
        <div className="flex items-center gap-1">
          <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} className="grid h-8 w-8 place-items-center rounded-md border border-line-strong hover:bg-hover disabled:opacity-40 disabled:hover:bg-transparent" aria-label="Previous page">
            <CaretLeft size={14} weight="bold" />
          </button>
          <span className="tnum px-2">Page {current + 1} of {pages}</span>
          <button type="button" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="grid h-8 w-8 place-items-center rounded-md border border-line-strong hover:bg-hover disabled:opacity-40 disabled:hover:bg-transparent" aria-label="Next page">
            <CaretRight size={14} weight="bold" />
          </button>
        </div>
      </div>
    </section>
  );
}
