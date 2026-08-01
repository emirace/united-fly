"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { QRCodeCanvas } from "qrcode.react";
import IMAGES from "@/lib/images";
import { cabinKeyFor } from "@/lib/cabins";
import { dirFor, usesLatinEyebrow, type Locale } from "@/i18n/config";
import type { TicketData } from "@/lib/ticket";

/**
 * The printable e-ticket. This node is never seen on screen — it is mounted
 * off-viewport, photographed by html2canvas, and unmounted.
 *
 * Three rules make it survivable, and breaking any of them produces a blank or
 * mis-coloured PDF rather than a visible bug:
 *
 * 1. **No Tailwind classes anywhere in this subtree.** Tailwind v4 compiles
 *    `bg-white/10` to `color-mix(in oklab, …)` and its palette to `oklch()`.
 *    html2canvas-pro can parse those, but inline literal hex removes the whole
 *    question — and keeps the ticket light while the app is dark-only.
 * 2. **No `h1`–`h3`.** `@layer base` in globals.css forces a font and letter
 *    spacing onto them, so the ticket's typography would silently drift with
 *    the site's.
 * 3. **No react-icons.** They are inline `<svg>`, which pushes html2canvas onto
 *    its serialise-to-image path — the flakiest thing it does. Text and CSS
 *    shapes only.
 *
 * The width is fixed at A4-at-96dpi and nothing inside uses viewport or
 * percentage units, so the capture is identical on every screen.
 */
export const TICKET_WIDTH_PX = 794;

const C = {
  paper: "#ffffff",
  panel: "#f6f5f2",
  rule: "#e6e4de",
  ink: "#101114",
  dim: "#6b6d76",
  accent: "#6e5bf5",
  dark: "#0c0e11",
  onDark: "#f3f2f7",
  onDarkDim: "#9c9ea8",
};

/**
 * Booking status is stored in English and shown here in the reader's language.
 * Anything unrecognised falls through to the raw stored value rather than a
 * missing-key crash mid-capture.
 */
const STATUS_KEYS: Record<string, string> = {
  pending: "pending",
  confirmed: "confirmed",
  cancelled: "cancelled",
  "checked-in": "checkedIn",
  completed: "completed",
};

const SANS = "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-plex-mono), ui-monospace, monospace";
const DISPLAY = "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif";

/**
 * References, codes, times and fares stay left-to-right even in Arabic. A
 * booking reference read backwards is useless at a check-in desk, and the
 * isolate stops an RTL neighbour from reordering it.
 */
const Ltr = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <span dir="ltr" style={{ unicodeBidi: "isolate", ...style }}>
    {children}
  </span>
);

/**
 * The small label style. Non-Latin scripts drop the mono face, the uppercasing
 * and the tracking — see `nonLatinLocales` in i18n/config.ts. On the ticket the
 * stakes are higher than on screen: html2canvas responds to letter-spacing by
 * positioning each character individually, which mangled Arabic ligatures
 * outright and spread Japanese labels into 手 荷 物.
 */
const micro = (latin: boolean): React.CSSProperties =>
  latin
    ? {
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
      }
    : { fontFamily: SANS, fontSize: 10.5, fontWeight: 500 };

const Label = ({
  children,
  align,
  latin,
}: {
  children: React.ReactNode;
  align: "left" | "right";
  latin: boolean;
}) => (
  <div
    style={{
      ...micro(latin),
      color: C.dim,
      textAlign: align,
      marginBottom: 4,
    }}
  >
    {children}
  </div>
);

interface TicketDocumentProps {
  data: TicketData;
  locale: Locale;
}

const TicketDocument = React.forwardRef<HTMLDivElement, TicketDocumentProps>(
  function TicketDocument({ data, locale }, ref) {
    const t = useTranslations("ticket");
    const tc = useTranslations("common");

    const rtl = dirFor(locale) === "rtl";
    const latin = usesLatinEyebrow(locale);
    const start = rtl ? "right" : "left";
    const end = rtl ? "left" : "right";

    const facts = [
      { label: t("flightNumber"), value: data.flightNumber, ltr: true },
      { label: t("cabin"), value: tc(`cabins.${cabinKeyFor(data.cabinKey)}`) },
      { label: t("departure"), value: data.departure, ltr: true },
      { label: t("arrival"), value: data.arrival, ltr: true },
      { label: t("duration"), value: data.duration, ltr: true },
      {
        label: t("status"),
        value: STATUS_KEYS[data.status]
          ? t(`statuses.${STATUS_KEYS[data.status]}`)
          : data.status,
      },
    ];

    const notes = [
      t("notes.checkIn"),
      t("notes.airport"),
      t("notes.carryOn"),
      t("notes.checked"),
      t("notes.documents"),
      t("notes.gate"),
    ];

    return (
      <div
        ref={ref}
        dir={dirFor(locale)}
        style={{
          width: TICKET_WIDTH_PX,
          boxSizing: "border-box",
          background: C.paper,
          color: C.ink,
          fontFamily: SANS,
          fontSize: 13,
          lineHeight: 1.45,
        }}
      >
        {/* ---------------------------------------------------- header --- */}
        <div
          style={{
            background: C.dark,
            color: C.onDark,
            padding: "22px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* A plain <img>, not next/image: that renders a <picture> with a
                srcset and lazy loading, and html2canvas cannot reliably resolve
                which candidate was painted. Same-origin, so no crossOrigin —
                setting it would taint the canvas and make toDataURL throw. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMAGES.logo} width={34} height={34} alt="" />
            <div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                United Fly Airlines
              </div>
              <div
                style={{
                  ...micro(latin),
                  color: C.onDarkDim,
                  marginTop: 2,
                }}
              >
                {t("docType")}
              </div>
            </div>
          </div>

          <div style={{ textAlign: end }}>
            <div
              style={{
                ...micro(latin),
                color: C.onDarkDim,
                marginBottom: 3,
              }}
            >
              {t("bookingRef")}
            </div>
            <Ltr
              style={{
                display: "block",
                fontFamily: MONO,
                fontSize: 17,
                fontWeight: 600,
                textAlign: end,
              }}
            >
              {data.reference}
            </Ltr>
          </div>
        </div>

        <div style={{ padding: "26px 32px 30px" }}>
          {/* -------------------------------------------------- route --- */}
          {/* Forced LTR: an itinerary reads origin → destination in every
              language, and a mirrored one is misread at a gate. */}
          <div
            dir="ltr"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "18px 22px",
              background: C.panel,
              borderRadius: 14,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 42,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {data.originCode}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 6 }}>
                {data.originCity}
              </div>
              <div style={{ fontSize: 11, color: C.dim }}>{data.departure}</div>
            </div>

            <div style={{ flex: 1, textAlign: "center", paddingBottom: 22 }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: C.dim,
                  marginBottom: 6,
                }}
              >
                {data.duration}
              </div>
              {/* A dotted rule rather than an arrow glyph — an arrow points the
                  wrong way the moment the page direction flips. */}
              <div
                style={{
                  position: "relative",
                  height: 1,
                  borderTop: `1px dashed ${C.rule}`,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: -3,
                    left: "50%",
                    marginLeft: -3,
                    width: 6,
                    height: 6,
                    borderRadius: 6,
                    background: C.accent,
                  }}
                />
              </div>
            </div>

            <div style={{ minWidth: 0, flex: 1, textAlign: "right" }}>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 42,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {data.destinationCode}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 6 }}>
                {data.destinationCity}
              </div>
              <div style={{ fontSize: 11, color: C.dim }}>{data.arrival}</div>
            </div>
          </div>

          {/* --------------------------------------------------- facts --- */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: 22,
              borderTop: `1px solid ${C.rule}`,
            }}
          >
            {facts.map((fact) => (
              <div
                key={fact.label}
                style={{
                  width: "33.333%",
                  boxSizing: "border-box",
                  paddingBlock: 12,
                  paddingInlineEnd: 14,
                  borderBottom: `1px solid ${C.rule}`,
                }}
              >
                <Label align={start} latin={latin}>{fact.label}</Label>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    textAlign: start,
                  }}
                >
                  {fact.ltr ? <Ltr>{fact.value}</Ltr> : fact.value}
                </div>
              </div>
            ))}
          </div>

          {/* ---------------------------------------------- passengers --- */}
          <div style={{ marginTop: 22 }}>
            <Label align={start} latin={latin}>{t("passengers")}</Label>
            <div style={{ borderTop: `1px solid ${C.rule}` }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: `1px solid ${C.rule}`,
                  ...micro(latin),
                  color: C.dim,
                }}
              >
                <span>{t("passengerName")}</span>
                <span>{t("seat")}</span>
              </div>
              {data.passengers.length ? (
                data.passengers.map((passenger, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 16,
                      padding: "9px 0",
                      borderBottom: `1px solid ${C.rule}`,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      {passenger.name}
                    </span>
                    <Ltr
                      style={{
                        fontFamily: MONO,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {passenger.seat}
                    </Ltr>
                  </div>
                ))
              ) : (
                <div style={{ padding: "9px 0", color: C.dim }}>
                  {t("noSeat")}
                </div>
              )}
            </div>
            {data.seatSummary && (
              <div style={{ marginTop: 8, fontSize: 11, color: C.dim }}>
                {t("seatsSummary", { seats: data.seatSummary })}
              </div>
            )}
          </div>

          {/* ----------------------------------------------- fare + qr --- */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              marginTop: 22,
              padding: "18px 22px",
              background: C.panel,
              borderRadius: 14,
            }}
          >
            <div>
              {data.fare && (
                <>
                  <Label align={start} latin={latin}>{t("totalPaid")}</Label>
                  <Ltr
                    style={{
                      display: "block",
                      fontFamily: DISPLAY,
                      fontSize: 26,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      textAlign: start,
                    }}
                  >
                    {data.fare}
                  </Ltr>
                </>
              )}
              <div
                style={{
                  marginTop: data.fare ? 10 : 0,
                  fontSize: 11,
                  color: C.dim,
                  textAlign: start,
                  maxWidth: 360,
                }}
              >
                {t("disclaimer")}
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              {/* QRCodeCanvas, not QRCodeSVG (which the payment screens use):
                  html2canvas copies a real <canvas> with drawImage, whereas an
                  inline <svg> goes through serialise-and-decode and can come
                  back blank without throwing. */}
              <QRCodeCanvas
                value={data.reference}
                size={116}
                level="M"
                marginSize={2}
                bgColor={C.panel}
                fgColor={C.dark}
              />
              <div
                style={{
                  marginTop: 6,
                  ...micro(latin),
                  color: C.dim,
                }}
              >
                {t("scanAtCheckIn")}
              </div>
            </div>
          </div>

          {/* --------------------------------------------------- notes --- */}
          <div style={{ marginTop: 22 }}>
            <Label align={start} latin={latin}>{t("notesTitle")}</Label>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {notes.map((note, index) => (
                <div
                  key={index}
                  style={{
                    width: "50%",
                    boxSizing: "border-box",
                    display: "flex",
                    gap: 8,
                    paddingBlock: 5,
                    paddingInlineEnd: 16,
                    fontSize: 10.5,
                    lineHeight: 1.5,
                    color: C.dim,
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      marginTop: 6,
                      width: 3,
                      height: 3,
                      borderRadius: 3,
                      background: C.accent,
                    }}
                  />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* -------------------------------------------------- footer --- */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              marginTop: 20,
              paddingTop: 12,
              borderTop: `1px solid ${C.rule}`,
              ...micro(latin),
              color: C.dim,
            }}
          >
            <Ltr>{data.reference}</Ltr>
            <span>{t("issued", { date: data.issued })}</span>
            <Ltr>{t("support")}</Ltr>
          </div>
        </div>
      </div>
    );
  }
);

export default TicketDocument;
