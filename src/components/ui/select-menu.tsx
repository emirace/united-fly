"use client";

import { useState, useEffect, useRef } from "react";
import { FiChevronDown } from "react-icons/fi";
import { cn } from "@/lib/cn";

interface Option {
  label: string;
  value: string;
  hint?: string;
}

interface Props {
  options: Option[];
  onChange: (value: string) => void;
  value: string;
  placeholder?: string;
  className?: string;
  /** Renders the trigger as bare text (used inside the hairline search grid). */
  bare?: boolean;
}

/**
 * Custom dropdown used across the booking flow. Kept as a bespoke component
 * rather than a native `<select>` so options can carry a secondary hint line.
 */
const SelectMenu: React.FC<Props> = ({
  options,
  placeholder = "Select",
  onChange,
  value,
  className,
  bare,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"bottom" | "top">("bottom");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value) || null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setPosition(window.innerHeight - rect.bottom < 240 ? "top" : "bottom");
    }
  }, [isOpen]);

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-3 text-left transition-colors",
          bare
            ? "py-0.5"
            : cn(
                "rounded-control border bg-field px-4 py-3",
                isOpen ? "border-accent" : "border-line-strong"
              )
        )}
      >
        <span
          className={cn(
            "truncate",
            bare ? "font-display text-lg font-semibold" : "text-sm",
            selected ? "text-fg" : "text-faint"
          )}
        >
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown
          className={cn(
            "shrink-0 text-dim transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-30 w-full min-w-[15rem] overflow-hidden rounded-card border border-line-strong bg-raised shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)]",
            position === "top" ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          <div className="max-h-60 overflow-y-auto scrollbar-slim">
            {options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "cursor-pointer px-4 py-3 text-sm transition-colors hover:bg-accent/12",
                    option.value === value
                      ? "bg-accent/12 text-accent-bright"
                      : "text-muted"
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <div>{option.label}</div>
                  {option.hint && (
                    <div className="mt-0.5 text-xs text-faint">
                      {option.hint}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-sm text-faint">
                No options available
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectMenu;
