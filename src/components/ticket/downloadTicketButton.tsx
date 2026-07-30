"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { HiOutlineDownload } from "react-icons/hi";
import { IBooking } from "@/context/booking";
import { useToastNotification } from "@/context/toastNotification";
import { Button } from "@/components/ui";
import Loading from "@/components/common/loading";
import { downloadNodeAsPdf } from "@/utils/pdf";
import {
  buildTicketData,
  isTicketable,
  ticketFileName,
  type TicketFare,
} from "@/lib/ticket";
import { defaultLocale, isLocale } from "@/i18n/config";
import TicketDocument, { TICKET_WIDTH_PX } from "./ticketDocument";

/**
 * Off-screen rather than hidden. Every other way of hiding the ticket breaks
 * the capture: `display:none` gives it no box, `visibility:hidden` is honoured
 * by html2canvas so it paints nothing, `opacity:0` renders it transparent, and
 * a clipped `height:0` crops it. Position it far to the side instead.
 *
 * `position: fixed` also keeps the node's rect viewport-relative, which avoids
 * having to feed html2canvas the page's scroll offsets.
 */
const OFFSCREEN: React.CSSProperties = {
  position: "fixed",
  top: 0,
  insetInlineStart: -10000,
  width: TICKET_WIDTH_PX,
  pointerEvents: "none",
  zIndex: -1,
};

interface DownloadTicketButtonProps {
  booking?: IBooking | null;
  fare?: TicketFare | null;
  variant?: "primary" | "outline" | "white" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function DownloadTicketButton({
  booking,
  fare,
  variant = "outline",
  size = "sm",
  className,
}: DownloadTicketButtonProps) {
  const t = useTranslations("ticket");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const { addNotification } = useToastNotification();

  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  // A ref, not state: React Strict Mode double-invokes the capture effect in
  // development, and a ref survives that where a state read would not.
  const inFlight = useRef(false);

  const ready = isTicketable(booking);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;
    const node = nodeRef.current;

    const run = async () => {
      try {
        if (!node || !booking) return;
        await downloadNodeAsPdf(node, {
          fileName: ticketFileName(booking.bookingId),
        });
      } catch (error) {
        console.error("Ticket generation failed:", error);
        if (!cancelled) addNotification({ message: t("error"), error: true });
      } finally {
        if (!cancelled) {
          setMounted(false);
          setBusy(false);
        }
        inFlight.current = false;
      }
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const handleClick = () => {
    if (inFlight.current || !ready) return;
    inFlight.current = true;
    setBusy(true);
    // Mounting on click rather than keeping a hidden ticket around matters on
    // the bookings list — otherwise 30 bookings means 30 off-screen 794px
    // documents and 30 QR canvases on first paint.
    setMounted(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={busy || !ready}
        onClick={handleClick}
      >
        {busy ? (
          <Loading size="sm" color={variant === "primary" ? "border-white" : undefined} />
        ) : (
          <HiOutlineDownload size={16} />
        )}
        {busy ? t("preparing") : t("download")}
      </Button>

      {/* Portalled to the body, not rendered in place. The modal panel carries
          `transition-transform … scale-100`, and a transform creates a
          containing block for fixed-position descendants — so inside the modal
          the ticket would be positioned against the panel and inherit its
          scale, and be clipped by its overflow. */}
      {mounted && booking
        ? createPortal(
            <div style={OFFSCREEN} aria-hidden="true">
              <TicketDocument
                ref={nodeRef}
                locale={locale}
                data={buildTicketData(booking, locale, fare)}
              />
            </div>,
            document.body
          )
        : null}
    </>
  );
}
