import { useEffect, useMemo, useState } from "react";
import { loadStoreData, money, prettyCategory, stockStatus } from "./api";
import BarChart from "./components/BarChart";
import ChartCard, { DataTable } from "./components/ChartCard";
import OrdersTable from "./components/OrdersTable";
import StatTile from "./components/StatTile";
import StockChart, { STATUS } from "./components/StockChart";
import Tooltip from "./components/Tooltip";

const THEMES = ["system", "light", "dark"];

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [tip, setTip] = useState(null);
  const [theme, setTheme] = useState("system");

  const refresh = () => {
    setLoading(true);
    setError("");
    loadStoreData()
      .then(setData)
      .catch((e) => setError(e.message || "Could not load data"))
      .finally(() => setLoading(false));
  };
  useEffect(refresh, []);

  useEffect(() => {
    if (theme === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const categories = useMemo(
    () => (data ? [...new Set(data.products.map((p) => p.category))].sort() : []),
    [data]
  );

  // Everything below the filter row uses this same slice, so the numbers always agree.
  const view = useMemo(() => {
    if (!data) return null;
    const inCat = (c) => category === "all" || c === category;

    const orders = data.orders
      .map((o) => {
        const lines = o.lines.filter((l) => inCat(l.category));
        return {
          ...o,
          lines,
          total: category === "all" ? o.total : lines.reduce((s, l) => s + l.revenue, 0),
          items: lines.reduce((s, l) => s + l.quantity, 0),
        };
      })
      .filter((o) => o.lines.length > 0);

    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const lines = orders.flatMap((o) => o.lines);

    // Chart 1: revenue by category (all) or top products (one category).
    const groups = new Map();
    for (const l of lines) {
      const key = category === "all" ? prettyCategory(l.category) : l.title;
      groups.set(key, (groups.get(key) || 0) + l.revenue);
    }
    const revenueRows = [...groups].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 10);

    // Chart 2: stock status by category.
    const products = data.products.filter((p) => inCat(p.category));
    const stockMap = new Map();
    for (const p of products) {
      const key = prettyCategory(p.category);
      const row = stockMap.get(key) || { label: key, in: 0, low: 0, out: 0 };
      row[stockStatus(p.stock)] += 1;
      stockMap.set(key, row);
    }
    const stockRows = [...stockMap.values()].sort((a, b) => b.low + b.out - (a.low + a.out) || a.label.localeCompare(b.label)).slice(0, 10);
    const restock = products.filter((p) => p.stock < 10).sort((a, b) => a.stock - b.stock);

    return { orders, revenue, revenueRows, stockRows, restock, productCount: products.length };
  }, [data, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--series-1)" }}>Store admin</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Sales &amp; inventory overview</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
            Live demo data from the public <a className="underline" href="https://dummyjson.com" target="_blank" rel="noreferrer">DummyJSON</a> API.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="sr-only" htmlFor="theme">Theme</label>
          <select id="theme" value={theme} onChange={(e) => setTheme(e.target.value)} className="rounded-md px-2.5 py-1.5" style={{ border: "1px solid var(--ring)", background: "var(--surface)" }}>
            {THEMES.map((t) => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)} theme</option>)}
          </select>
          <button type="button" onClick={refresh} disabled={loading} className="rounded-md px-3 py-1.5 font-medium text-white disabled:opacity-60" style={{ background: "var(--series-1)" }}>
            {loading ? "Loading…" : "Refresh data"}
          </button>
        </div>
      </header>

      {/* Filter row: scopes every tile, chart and table below it. */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label htmlFor="category" className="text-sm" style={{ color: "var(--ink-2)" }}>Category</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} disabled={!data} className="rounded-md px-3 py-1.5 text-sm" style={{ border: "1px solid var(--ring)", background: "var(--surface)" }}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{prettyCategory(c)}</option>)}
        </select>
        {category !== "all" && (
          <button type="button" onClick={() => setCategory("all")} className="text-sm underline" style={{ color: "var(--ink-2)" }}>Clear</button>
        )}
      </div>

      {error && (
        <div role="alert" className="card mb-6 p-4 text-sm" style={{ borderColor: "var(--critical)" }}>
          <strong>✕ Couldn't load data.</strong> {error}. <button className="underline" onClick={refresh}>Try again</button>
        </div>
      )}

      {!view && !error && <p style={{ color: "var(--ink-2)" }}>Loading store data…</p>}

      {view && (
        <div className={`space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatTile label="Revenue" value={money.format(view.revenue)} note="After discounts" />
            <StatTile label="Orders" value={view.orders.length.toLocaleString()} />
            <StatTile label="Average order" value={money.format(view.orders.length ? view.revenue / view.orders.length : 0)} />
            <StatTile label="Products to restock" value={view.restock.length} note={`of ${view.productCount} products`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title={category === "all" ? "Revenue by category" : "Top products by revenue"}
              subtitle={category === "all" ? "Top 10 categories" : prettyCategory(category)}
              table={<DataTable columns={[{ key: "label", label: "Name" }, { key: "value", label: "Revenue", align: "right" }]} rows={view.revenueRows.map((r) => ({ label: r.label, value: money.format(r.value) }))} />}
            >
              {view.revenueRows.length ? <BarChart rows={view.revenueRows} format={(v) => money.format(v)} onTip={setTip} /> : <p className="text-sm" style={{ color: "var(--muted)" }}>No sales in this category yet.</p>}
            </ChartCard>

            <ChartCard
              title="Inventory health"
              subtitle="Products per category by stock level"
              table={<DataTable columns={[{ key: "label", label: "Category" }, ...STATUS.map((s) => ({ key: s.key, label: s.label, align: "right" }))]} rows={view.stockRows} />}
            >
              <StockChart rows={view.stockRows} onTip={setTip} />
            </ChartCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <OrdersTable orders={view.orders} />
            <section className="card p-5">
              <h2 className="text-base font-semibold">Needs restocking</h2>
              <p className="mt-0.5 mb-4 text-sm" style={{ color: "var(--ink-2)" }}>Lowest stock first</p>
              <ul className="max-h-96 space-y-2 overflow-auto text-sm">
                {view.restock.map((p) => {
                  const s = STATUS.find((x) => x.key === stockStatus(p.stock));
                  return (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-1" style={{ borderTop: "1px solid var(--grid)" }}>
                      <span className="truncate">{p.title}</span>
                      <span className="flex shrink-0 items-center gap-1.5 tnum" style={{ color: "var(--ink-2)" }}>
                        <span style={{ color: s.color }} aria-hidden="true">{s.icon}</span>
                        {p.stock === 0 ? "Sold out" : `${p.stock} left`}
                      </span>
                    </li>
                  );
                })}
                {view.restock.length === 0 && <li style={{ color: "var(--muted)" }}>✓ Everything is well stocked.</li>}
              </ul>
            </section>
          </div>
        </div>
      )}

      <footer className="mt-10 text-sm" style={{ color: "var(--muted)" }}>
        Built by <a className="underline" href="https://joshua-adesomoju.vercel.app" target="_blank" rel="noreferrer">Joshua Adesomoju</a> with React and Tailwind CSS.
      </footer>
      <Tooltip tip={tip} />
    </div>
  );
}
