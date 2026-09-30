import { useEffect, useMemo, useState } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { loadStoreData, money, prettyCategory, stockStatus } from "./api";
import BarChart from "./components/BarChart";
import ChartCard, { ChartSkeleton, DataTable } from "./components/ChartCard";
import MetricStrip, { MetricStripSkeleton } from "./components/MetricStrip";
import OrdersTable from "./components/OrdersTable";
import RestockList from "./components/RestockList";
import Sidebar, { NAV } from "./components/Sidebar";
import StockChart, { STATUS } from "./components/StockChart";
import Tooltip from "./components/Tooltip";
import Topbar from "./components/Topbar";

const pct = (a, b) => (b ? `${((a / b) * 100).toFixed(1)}%` : "0%");

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState("");
  const [category, setCategory] = useState("all");
  const [tip, setTip] = useState(null);
  const [theme, setTheme] = useState("system");
  const [navOpen, setNavOpen] = useState(false);
  const [section, setSection] = useState("#overview");

  const refresh = () => {
    setLoading(true);
    setError("");
    loadStoreData()
      .then((d) => {
        setData(d);
        setUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      })
      .catch((e) => setError(e.message || "Could not load data"))
      .finally(() => setLoading(false));
  };
  useEffect(refresh, []);

  useEffect(() => {
    if (theme === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Highlight the sidebar item for the section in view.
  useEffect(() => {
    if (!data) return;
    const els = NAV.map((n) => document.querySelector(n.href)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setSection(`#${visible[0].target.id}`);
      },
      { rootMargin: "-120px 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [data]);

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
          listTotal: category === "all" ? o.listTotal : lines.reduce((s, l) => s + (l.listRevenue ?? l.revenue), 0),
          items: lines.reduce((s, l) => s + l.quantity, 0),
        };
      })
      .filter((o) => o.lines.length > 0);

    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const allRevenue = data.orders.reduce((s, o) => s + o.total, 0);
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
    const soldOut = restock.filter((p) => p.stock === 0).length;

    return { orders, revenue, allRevenue, revenueRows, stockRows, restock, soldOut, productCount: products.length };
  }, [data, category]);

  const metrics = view && [
    { label: "Revenue", value: money.format(view.revenue), note: category === "all" ? "After discounts" : `${pct(view.revenue, view.allRevenue)} of all revenue` },
    { label: "Orders", value: view.orders.length.toLocaleString(), note: category === "all" ? "All carts" : "Containing this category" },
    { label: "Average order", value: money.format(view.orders.length ? view.revenue / view.orders.length : 0), note: "Revenue per order" },
    { label: "Products to restock", value: view.restock.length, note: `${view.soldOut} sold out · ${view.productCount} products` },
  ];

  return (
    <div className="lg:grid lg:grid-cols-[15rem_1fr]">
      <Sidebar active={section} open={navOpen} onClose={() => setNavOpen(false)} onNavigate={() => setNavOpen(false)} restockCount={view?.restock.length ?? 0} theme={theme} setTheme={setTheme} />

      <div className="min-w-0">
        <Topbar
          categories={categories}
          category={category}
          setCategory={setCategory}
          theme={theme}
          setTheme={setTheme}
          loading={loading}
          onRefresh={refresh}
          onMenu={() => setNavOpen(true)}
          updated={updated}
        />

        <main className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6">
          {error && (
            <div role="alert" className="panel flex flex-wrap items-center gap-3 p-4" style={{ borderColor: "var(--critical)" }}>
              <WarningCircle size={20} weight="fill" style={{ color: "var(--critical)" }} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Couldn't load store data</p>
                <p className="text-[13px] text-ink-2">{error}. Check your connection and try again.</p>
              </div>
              <button type="button" onClick={refresh} className="btn-primary">Try again</button>
            </div>
          )}

          {!view && !error && (
            <div className="space-y-5" aria-busy="true" aria-label="Loading store data">
              <MetricStripSkeleton />
              <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
                <ChartSkeleton />
                <ChartSkeleton />
              </div>
            </div>
          )}

          {view && (
            <div className={`space-y-5 transition-opacity duration-200 ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
              <MetricStrip items={metrics} />

              <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
                <ChartCard
                  id="revenue"
                  title={category === "all" ? "Revenue by category" : "Top products by revenue"}
                  subtitle={category === "all" ? "Top 10 categories, after discounts" : prettyCategory(category)}
                  table={<DataTable columns={[{ key: "label", label: "Name" }, { key: "value", label: "Revenue", align: "right" }, { key: "share", label: "Share", align: "right" }]} rows={view.revenueRows.map((r) => ({ label: r.label, value: money.format(r.value), share: pct(r.value, view.revenue) }))} />}
                >
                  {view.revenueRows.length ? (
                    <BarChart rows={view.revenueRows} format={(v) => money.format(v)} onTip={setTip} />
                  ) : (
                    <p className="py-10 text-center text-ink-2">No sales in this category yet.</p>
                  )}
                </ChartCard>

                <ChartCard
                  id="inventory"
                  title="Inventory health"
                  subtitle="Products per category by stock level"
                  table={<DataTable columns={[{ key: "label", label: "Category" }, ...STATUS.map((s) => ({ key: s.key, label: s.short, align: "right" }))]} rows={view.stockRows} />}
                >
                  <StockChart rows={view.stockRows} onTip={setTip} />
                </ChartCard>
              </div>

              <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
                <OrdersTable orders={view.orders} />
                <RestockList items={view.restock} />
              </div>
            </div>
          )}
        </main>
      </div>
      <Tooltip tip={tip} />
    </div>
  );
}
