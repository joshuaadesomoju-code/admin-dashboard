import { useEffect } from "react";
import { ThemeSwitch } from "./Topbar";
import { ChartBar, Package, Receipt, SquaresFour, Storefront, WarningCircle, X } from "@phosphor-icons/react";

// Every item scrolls to a real section of this single-page console.
export const NAV = [
  { href: "#overview", label: "Overview", icon: SquaresFour },
  { href: "#revenue", label: "Revenue", icon: ChartBar },
  { href: "#inventory", label: "Inventory", icon: Package },
  { href: "#orders", label: "Orders", icon: Receipt },
  { href: "#restock", label: "Restock", icon: WarningCircle },
];

export default function Sidebar({ active, onNavigate, open, onClose, restockCount, theme, setTheme }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overscroll-contain border-r border-line bg-rail transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:w-60 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar"
      >
        <div className="flex h-14 items-center justify-between px-4">
          <a href="#overview" translate="no" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-page">
              <Storefront size={16} weight="bold" />
            </span>
            Storefront Admin
          </a>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-ink-2 hover:bg-hover lg:hidden" aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-0.5 px-2" aria-label="Sections">
          {NAV.map(({ href, label, icon: Icon }) => {
            const current = active === href;
            return (
              <a
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={current ? "location" : undefined}
                className={`flex h-9 items-center gap-2.5 rounded-md px-2.5 font-medium transition-colors ${
                  current ? "bg-panel text-ink shadow-[var(--shadow)] ring-1 ring-line" : "text-ink-2 hover:bg-hover hover:text-ink"
                }`}
              >
                <Icon size={18} weight={current ? "fill" : "regular"} className={current ? "text-accent" : ""} />
                {label}
                {href === "#restock" && restockCount > 0 && (
                  <span className="tnum ml-auto rounded-full bg-hover px-2 text-xs font-medium text-ink-2">{restockCount}</span>
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center justify-between border-t border-line px-4 py-3 sm:hidden">
          <span className="text-[13px] text-ink-2">Theme</span>
          <ThemeSwitch theme={theme} setTheme={setTheme} className="flex" />
        </div>
        <div className="space-y-1 border-t border-line p-4 text-xs leading-relaxed text-muted">
          <p>
            Demo data from the public{" "}
            <a className="underline decoration-line-strong underline-offset-2 hover:text-ink" href="https://dummyjson.com" target="_blank" rel="noreferrer">DummyJSON</a> API.
          </p>
          <p>
            Built by{" "}
            <a className="font-medium text-ink-2 underline decoration-line-strong underline-offset-2 hover:text-ink" href="https://joshua-adesomoju.vercel.app" target="_blank" rel="noreferrer">Joshua Adesomoju</a>
          </p>
        </div>
      </aside>
    </>
  );
}
