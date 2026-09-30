import { ArrowClockwise, Desktop, List, Moon, Sun, X } from "@phosphor-icons/react";
import { prettyCategory } from "../api";

export const THEMES = [
  { value: "system", label: "System theme", icon: Desktop },
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
];

export function ThemeSwitch({ theme, setTheme, className = "" }) {
  return (
    <div className={`items-center rounded-lg border border-line-strong bg-panel p-0.5 ${className}`} role="radiogroup" aria-label="Theme">
      {THEMES.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          onClick={() => setTheme(value)}
          className={`grid h-7 w-7 place-items-center rounded-md transition-colors ${theme === value ? "bg-hover text-ink" : "text-muted hover:text-ink"}`}
        >
          <Icon size={15} weight={theme === value ? "fill" : "regular"} />
        </button>
      ))}
    </div>
  );
}

export default function Topbar({ categories, category, setCategory, theme, setTheme, loading, onRefresh, onMenu, updated }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-page/90 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button type="button" onClick={onMenu} className="-ml-1 grid h-9 w-9 place-items-center rounded-md text-ink-2 hover:bg-hover lg:hidden" aria-label="Open navigation">
          <List size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold">Overview</h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitch theme={theme} setTheme={setTheme} className="hidden sm:flex" />
          <button type="button" onClick={onRefresh} disabled={loading} className="btn-primary">
            <ArrowClockwise size={15} weight="bold" className={loading ? "animate-spin motion-reduce:animate-none" : ""} />
            <span className="hidden sm:inline">{loading ? (updated ? "Refreshing…" : "Loading…") : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Filter row: scopes every metric, chart and table below it. */}
      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-2.5 sm:px-6">
        <label htmlFor="category" className="text-ink-2">Category</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} disabled={!categories.length} className="control min-w-44">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{prettyCategory(c)}</option>)}
        </select>
        {category !== "all" && (
          <button type="button" onClick={() => setCategory("all")} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-accent-soft pl-3 pr-2 text-[13px] font-medium text-accent-ink hover:brightness-95">
            {prettyCategory(category)}
            <X size={13} weight="bold" aria-label="Clear category filter" />
          </button>
        )}
        {updated && <span aria-live="polite" className="ml-auto hidden text-xs text-muted sm:inline">Updated {updated}</span>}
      </div>
    </header>
  );
}
