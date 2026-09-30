// One strip, four readings, divided by hairlines rather than boxed separately.
export default function MetricStrip({ items }) {
  return (
    <section id="overview" aria-label="Key metrics" className="panel grid scroll-mt-32 grid-cols-2 lg:grid-cols-4">
      {items.map((m, i) => (
        <div
          key={m.label}
          className={`p-4 sm:p-5 ${i % 2 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
        >
          <p className="text-[13px] font-medium text-ink-2">{m.label}</p>
          <p className="tnum mt-2 text-[1.625rem] font-semibold leading-none tracking-tight sm:text-[1.875rem]">{m.value}</p>
          {m.note && <p className="mt-2 text-[13px] text-muted">{m.note}</p>}
        </div>
      ))}
    </section>
  );
}

export function MetricStripSkeleton() {
  return (
    <div className="panel grid grid-cols-2 lg:grid-cols-4" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`p-5 ${i % 2 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
          <div className="skeleton h-3.5 w-24" />
          <div className="skeleton mt-3 h-7 w-32" />
          <div className="skeleton mt-3 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}
