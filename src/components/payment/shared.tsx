"use client";

import { useEffect, useState } from "react";
import { FaRegCopy } from "react-icons/fa";
import { useToastNotification } from "@/context/toastNotification";

/** Copy-to-clipboard button; reports through the toast instead of `alert()`. */
export function CopyButton({ value }: { value?: string }) {
  const { addNotification } = useToastNotification();

  return (
    <button
      type="button"
      onClick={async () => {
        if (!value) return;
        try {
          await navigator.clipboard.writeText(value);
          addNotification({ message: "Copied to clipboard" });
        } catch {
          addNotification({ message: "Could not copy", error: true });
        }
      }}
      className="cursor-pointer text-dim transition-colors hover:text-fg"
      aria-label="Copy"
    >
      <FaRegCopy />
    </button>
  );
}

/** Label / value row used throughout the payment sheets. */
export function DetailRow({
  label,
  value,
  copy,
  mono,
}: {
  label: string;
  value?: React.ReactNode;
  copy?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line-soft py-3 last:border-b-0">
      <span className="text-[13px] text-dim">{label}</span>
      <span className="flex items-center gap-2 text-right text-sm font-medium break-all">
        <span className={mono ? "font-mono" : undefined}>{value || "—"}</span>
        {copy && <CopyButton value={copy} />}
      </span>
    </div>
  );
}

/** Counts down from `from` seconds and renders as m:ss. */
export function useCountdown(from: number) {
  const [seconds, setSeconds] = useState(from);

  useEffect(() => {
    const timer = setInterval(
      () => setSeconds((prev) => (prev > 0 ? prev - 1 : 0)),
      1000
    );
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

export const shortAddress = (address?: string): string => {
  if (!address || address.length < 10) return address || "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
