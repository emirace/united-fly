"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { useLatinEyebrow } from "@/lib/eyebrow";

/* ------------------------------------------------------------------ *
 * Eyebrow — the small uppercase mono label that opens nearly every
 * section and card in the design.
 *
 * Arabic and Japanese drop the mono face, the uppercasing and the
 * tracking: all three are Latin devices, and letter-spacing in
 * particular breaks Arabic's contextual joining. They get a slightly
 * larger sans label instead, since CJK and Arabic are hard to read at
 * 10px.
 * ------------------------------------------------------------------ */

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const latin = useLatinEyebrow();

  return (
    <div
      className={cn(
        "text-faint",
        latin
          ? "font-mono text-[10px] uppercase tracking-[0.16em]"
          : "text-[11px]",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Panel — hairline-bordered dark card.
 * ------------------------------------------------------------------ */

export function Panel({
  children,
  className,
  as: Tag = "div",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-line bg-panel",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ *
 * Button
 * ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "outline" | "white" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover shadow-[0_10px_30px_-12px_rgba(110,91,245,0.9)]",
  outline:
    "border border-line-strong bg-transparent text-fg hover:border-white/35",
  white: "bg-white text-ink hover:bg-fg",
  ghost: "bg-transparent text-muted hover:text-fg",
  danger: "bg-transparent text-danger hover:bg-danger/10",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[13px]",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-4 text-[15px]",
};

export function Button({
  variant = "primary",
  size = "md",
  pill,
  className,
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 font-display font-semibold transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        pill ? "rounded-full" : "rounded-btn",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Form controls
 * ------------------------------------------------------------------ */

const CONTROL_BASE =
  "w-full rounded-control border border-line-strong bg-field px-4 py-3 text-sm text-fg outline-none transition-colors focus:border-accent disabled:opacity-60";

export function Label({
  children,
  className,
  ...rest
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("mb-2 block text-xs text-dim", className)} {...rest}>
      {children}
    </label>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cn(CONTROL_BASE, className)} {...rest} />;
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...rest }, ref) {
  return (
    <select ref={ref} className={cn(CONTROL_BASE, className)} {...rest}>
      {children}
    </select>
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(CONTROL_BASE, "resize-y", className)}
      {...rest}
    />
  );
});

/** Label + control + error, the shape most forms in the app repeat. */
export function Field({
  label,
  error,
  children,
  className,
}: {
  label?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label ? <Label>{label}</Label> : null}
      {children}
      {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Pill / StatusDot
 * ------------------------------------------------------------------ */

type Tone = "neutral" | "accent" | "success" | "gold" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "border-line bg-white/5 text-muted",
  accent: "border-accent/40 bg-accent/12 text-accent-bright",
  success: "border-success/35 bg-success/12 text-success",
  gold: "border-gold/40 bg-gold/12 text-gold",
  danger: "border-danger/40 bg-danger/12 text-danger",
};

export function Pill({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const DOT_TONES: Record<Tone, string> = {
  neutral: "bg-faint",
  accent: "bg-accent",
  success: "bg-success",
  gold: "bg-gold",
  danger: "bg-danger",
};

export function StatusDot({
  tone = "success",
  pulse,
  className,
}: {
  tone?: Tone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block size-1.5 shrink-0 rounded-full",
        DOT_TONES[tone],
        pulse && "animate-soft-pulse",
        className
      )}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Stepper — the four-step booking progress bar.
 * ------------------------------------------------------------------ */

export function Stepper({
  steps,
  current,
  className,
}: {
  steps: string[];
  /** 1-based index of the active step. */
  current: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line-soft bg-[#0A0B0E] px-6 py-4 md:px-12",
        className
      )}
    >
      {steps.map((step, i) => {
        const index = i + 1;
        const done = index < current;
        const active = index === current;

        return (
          <div
            key={step}
            className={cn(
              "flex items-center gap-3",
              i < steps.length - 1 && "flex-1 min-w-[150px]"
            )}
          >
            <span
              className={cn(
                "flex size-[22px] shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold",
                done && "bg-success text-ink",
                active && "bg-accent text-white",
                !done && !active && "border border-line-strong text-faint"
              )}
            >
              {done ? "✓" : index}
            </span>
            <span
              className={cn(
                "text-[13px] whitespace-nowrap",
                active ? "font-medium text-fg" : done ? "text-dim" : "text-faint"
              )}
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "hidden h-px flex-1 md:block",
                  done ? "bg-success/35" : "bg-white/10"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Section heading used across marketing sections.
 * ------------------------------------------------------------------ */

export function SectionHeading({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-7 flex flex-wrap items-end justify-between gap-6",
        className
      )}
    >
      <div>
        {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
        <h2 className="m-0 text-3xl leading-none font-semibold md:text-[44px]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
