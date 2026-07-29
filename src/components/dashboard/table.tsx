"use client";

import React from "react";
import { FaSearch } from "react-icons/fa";
import { Eyebrow } from "@/components/ui";
import { cn } from "@/lib/cn";

/** Page header shared by every dashboard screen. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="m-0 text-2xl font-semibold tracking-[-0.03em] md:text-[34px]">
          {title}
        </h1>
        {subtitle && (
          <p className="m-0 mt-1.5 text-sm text-dim">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder,
  count,
  countLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  count?: number;
  countLabel?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {count !== undefined && (
        <span className="rounded-control border border-accent/35 bg-accent/12 px-3 py-2 text-[13px] text-accent-bright">
          {count} {countLabel}
        </span>
      )}
      <div className="relative min-w-[200px] flex-1">
        <FaSearch className="absolute top-1/2 left-3.5 -translate-y-1/2 text-faint" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-control border border-line-strong bg-field py-2.5 pr-4 pl-10 text-sm text-fg outline-none transition-colors focus:border-accent"
        />
      </div>
    </div>
  );
}

export function Table({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-card border border-line scrollbar-slim">
      <table className="w-full border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-white/4 text-left">
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3.5 font-mono text-[10px] tracking-[0.16em] text-faint uppercase"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty && (
        <div className="px-4 py-12 text-center text-sm text-dim">
          Nothing to show yet.
        </div>
      )}
    </div>
  );
}

export function Td({
  children,
  className,
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3.5 text-sm text-muted", className)} {...rest}>
      {children}
    </td>
  );
}

export function Tr({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b border-line-soft transition-colors last:border-b-0 hover:bg-white/3">
      {children}
    </tr>
  );
}

const STATUS_TONES: Record<string, string> = {
  success: "border-success/35 bg-success/12 text-success",
  warn: "border-gold/40 bg-gold/12 text-gold",
  danger: "border-danger/40 bg-danger/12 text-danger",
  neutral: "border-line bg-white/5 text-dim",
};

/** Maps the various status vocabularies in the app onto three tones. */
export function StatusBadge({ status }: { status?: string }) {
  const value = (status || "").toLowerCase();
  const tone = ["completed", "confirmed", "successful", "paid", "checked-in"].includes(
    value
  )
    ? "success"
    : ["pending"].includes(value)
      ? "warn"
      : ["failed", "cancelled", "refunded", "rejected"].includes(value)
        ? "danger"
        : "neutral";

  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2.5 py-1 text-xs capitalize",
        STATUS_TONES[tone]
      )}
    >
      {status || "—"}
    </span>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onChange: (page: number) => void;
}) {
  if (totalItems === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <Eyebrow>
        Showing {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
        {totalItems}
      </Eyebrow>
      <div className="flex items-center gap-1.5">
        <button
          disabled={currentPage === 1}
          className="cursor-pointer rounded-control px-3 py-1.5 text-[13px] text-accent-tint transition-colors hover:bg-accent/10 disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent"
          onClick={() => onChange(Math.max(currentPage - 1, 1))}
        >
          Prev
        </button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={cn(
              "cursor-pointer rounded-control px-3 py-1.5 text-[13px] transition-colors",
              currentPage === i + 1
                ? "bg-accent text-white"
                : "text-accent-tint hover:bg-accent/10"
            )}
            onClick={() => onChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          className="cursor-pointer rounded-control px-3 py-1.5 text-[13px] text-accent-tint transition-colors hover:bg-accent/10 disabled:cursor-not-allowed disabled:text-faint disabled:hover:bg-transparent"
          onClick={() => onChange(Math.min(currentPage + 1, totalPages))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
