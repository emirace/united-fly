"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FiChevronDown, FiGlobe } from "react-icons/fi";
import { setLocale } from "@/app/actions/locale";
import {
  locales,
  localeNames,
  localeShortNames,
  isLocale,
  defaultLocale,
} from "@/i18n/config";
import { cn } from "@/lib/cn";

/**
 * `pill` sits inside the navbar's USD·EN chip; `block` is a full-width control
 * for the mobile menu and the footer, where the chip is hidden.
 */
type Variant = "pill" | "block";

export default function LanguageSwitcher({
  variant = "pill",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const t = useTranslations("common");
  const active = useLocale();
  const current = isLocale(active) ? active : defaultLocale;

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const choose = (next: string) => {
    setOpen(false);
    if (next === current) return;
    startTransition(async () => {
      await setLocale(next);
      // Re-renders the tree with the locale resolved server-side, so the new
      // language is in place without a full page load.
      router.refresh();
    });
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={isPending}
        aria-label={t("changeLanguage")}
        aria-expanded={open}
        className={cn(
          "flex cursor-pointer items-center transition-colors disabled:opacity-60",
          variant === "pill"
            ? "gap-1.5 text-[13px] text-dim hover:text-fg"
            : cn(
                "w-full justify-between gap-3 rounded-control border bg-field px-4 py-3 text-sm",
                open ? "border-accent" : "border-line-strong"
              )
        )}
      >
        {variant === "block" && (
          <span className="flex items-center gap-2.5 text-muted">
            <FiGlobe className="shrink-0" />
            {localeNames[current]}
          </span>
        )}
        {variant === "pill" && <span>{localeShortNames[current]}</span>}
        <FiChevronDown
          className={cn(
            "shrink-0 text-dim transition-transform",
            open && "rotate-180"
          )}
          size={variant === "pill" ? 12 : 16}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[11rem] overflow-hidden rounded-card border border-line-strong bg-raised py-1 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)]",
            variant === "pill" ? "top-full end-0" : "top-full inset-x-0"
          )}
        >
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => choose(locale)}
              lang={locale}
              className={cn(
                "block w-full cursor-pointer px-4 py-2.5 text-start text-sm transition-colors hover:bg-accent/12",
                locale === current
                  ? "bg-accent/12 text-accent-bright"
                  : "text-muted"
              )}
            >
              {localeNames[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
