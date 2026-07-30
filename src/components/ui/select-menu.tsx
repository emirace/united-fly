"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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

const MENU_MAX_HEIGHT = 240;
const MENU_MIN_WIDTH = 240;
const GAP = 8;
/** Keep the menu off the very edge of the window. */
const EDGE = 8;

interface MenuBox {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
}

/**
 * Custom dropdown used across the booking flow. Kept as a bespoke component
 * rather than a native `<select>` so options can carry a secondary hint line.
 *
 * The menu is portalled to the body and positioned with `fixed` coordinates
 * measured from the trigger, rather than being absolutely positioned inside
 * the component. Both places this is used sit in a clipping container — the
 * home search grid needs `overflow-hidden` to round the hairline grid's
 * corners, and the dashboard modal is `overflow-y-auto` — so an absolutely
 * positioned menu is cut off by its own ancestor with no way to escape.
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
  const [box, setBox] = useState<MenuBox | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value) || null;

  const measure = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const width = Math.max(rect.width, MENU_MIN_WIDTH);
    const rtl = getComputedStyle(el).direction === "rtl";

    // Align to the trigger's leading edge, then pull back inside the window.
    const preferred = rtl ? rect.right - width : rect.left;
    const left = Math.min(
      Math.max(preferred, EDGE),
      Math.max(window.innerWidth - width - EDGE, EDGE)
    );

    // Flip above the trigger when there isn't room beneath it.
    const flip = window.innerHeight - rect.bottom < MENU_MAX_HEIGHT + GAP;

    setBox(
      flip
        ? { left, width, bottom: window.innerHeight - rect.top + GAP }
        : { left, width, top: rect.bottom + GAP }
    );
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    measure();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      // The menu lives outside this component's DOM subtree now, so it has to
      // be checked separately — otherwise choosing an option would unmount the
      // menu on mousedown and the option's click would never fire.
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    // Capture phase so scrolling inside any ancestor repositions the menu,
    // not just the window.
    const reposition = () => measure();

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [isOpen, measure]);

  return (
    <div className={cn("relative w-full", className)} ref={triggerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-3 text-start transition-colors",
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

      {isOpen && box
        ? createPortal(
            <div
              ref={menuRef}
              role="listbox"
              // z-60 clears the modal overlay, which this is used inside.
              className="fixed z-[60] overflow-hidden rounded-card border border-line-strong bg-raised shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)]"
              style={{
                left: box.left,
                width: box.width,
                top: box.top,
                bottom: box.bottom,
              }}
            >
              <div
                className="overflow-y-auto scrollbar-slim"
                style={{ maxHeight: MENU_MAX_HEIGHT }}
              >
                {options.length > 0 ? (
                  options.map((option) => (
                    <div
                      key={option.value}
                      role="option"
                      aria-selected={option.value === value}
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
            </div>,
            document.body
          )
        : null}
    </div>
  );
};

export default SelectMenu;
