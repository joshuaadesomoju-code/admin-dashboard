import { CheckCircle, Warning, XCircle } from "@phosphor-icons/react";

// Stock states. Colour always travels with an icon and a word.
export const STATUS = [
  { key: "in", label: "In stock", short: "In stock", icon: CheckCircle, color: "var(--good)", ink: "var(--good-ink)" },
  { key: "low", label: "Low (under 10)", short: "Low", icon: Warning, color: "var(--warning)", ink: "var(--warning-ink)" },
  { key: "out", label: "Sold out", short: "Sold out", icon: XCircle, color: "var(--critical)", ink: "var(--critical-ink)" },
];

export function StatusBadge({ status, children }) {
  const s = STATUS.find((x) => x.key === status);
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium" style={{ color: s.ink }}>
      <Icon size={15} weight="fill" style={{ color: s.color }} aria-hidden="true" />
      {children ?? s.short}
    </span>
  );
}
