import { CheckCircle } from "@phosphor-icons/react";
import { stockStatus, prettyCategory } from "../api";
import { StatusBadge } from "./Status";

export default function RestockList({ items }) {
  return (
    <section id="restock" className="panel flex scroll-mt-32 flex-col overflow-hidden">
      <div className="p-4 sm:px-5">
        <h2 className="text-[15px] font-semibold">Needs restocking</h2>
        <p className="mt-0.5 text-[13px] text-ink-2">Under 10 units, lowest first</p>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center">
          <CheckCircle size={28} weight="fill" className="text-good" aria-hidden="true" />
          <p className="mt-3 font-medium">Everything is well stocked</p>
          <p className="mt-1 text-[13px] text-ink-2">No product in this view is under 10 units.</p>
        </div>
      ) : (
        <ul className="max-h-[34rem] flex-1 overflow-auto border-t border-line">
          {items.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 last:border-0 hover:bg-hover sm:px-5">
              <div className="min-w-0">
                <p className="truncate font-medium">{p.title}</p>
                <p className="truncate text-xs text-muted">{prettyCategory(p.category)}</p>
              </div>
              <StatusBadge status={stockStatus(p.stock)}>{p.stock === 0 ? "Sold out" : `${p.stock} left`}</StatusBadge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
