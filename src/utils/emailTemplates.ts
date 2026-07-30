/**
 * Transactional email bodies.
 *
 * Written in English regardless of the site language: the message is triggered
 * by an admin approving a payment, so the only locale available on the request
 * is the admin's, and nothing on the user record records the traveller's own
 * choice. Guessing from the approver would be worse than not guessing.
 *
 * Email clients strip <style> blocks and have no flexbox or grid, so the layout
 * is tables with inline styles — this is not a place to reuse the app's
 * components.
 */

const C = {
  paper: "#ffffff",
  panel: "#f6f5f2",
  rule: "#e6e4de",
  ink: "#101114",
  dim: "#6b6d76",
  accent: "#6e5bf5",
  dark: "#0c0e11",
  success: "#1f7a55",
  danger: "#b23b33",
};

const escape = (value: unknown): string =>
  String(value ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatDate = (value?: string | Date) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
};

const formatMoney = (amount?: number, currency?: string) => {
  if (typeof amount !== "number") return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    return `${currency ?? ""} ${amount.toFixed(2)}`.trim();
  }
};

export interface PaymentEmailInput {
  recipientName: string;
  bookingRef: string;
  origin?: { city?: string; code?: string };
  destination?: { city?: string; code?: string };
  flightNumber?: string;
  departureTime?: string | Date;
  arrivalTime?: string | Date;
  cabin?: string;
  seats: string[];
  travellerCount: number;
  amount?: number;
  currency?: string;
  bookingsUrl: string;
  /** Only used by the failure email. */
  reason?: string;
}

const row = (label: string, value: string) => `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid ${C.rule};color:${C.dim};font-size:13px;">${escape(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${C.rule};color:${C.ink};font-size:13px;font-weight:600;text-align:right;">${escape(value)}</td>
  </tr>`;

const shell = (heading: string, tone: string, intro: string, body: string) => `
<div style="margin:0;padding:24px 12px;background:${C.panel};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:${C.paper};border-radius:14px;overflow:hidden;">
    <tr>
      <td style="background:${C.dark};padding:22px 28px;">
        <div style="color:#ffffff;font-size:17px;font-weight:700;">United Fly Airlines</div>
        <div style="color:#9c9ea8;font-size:11px;letter-spacing:.14em;text-transform:uppercase;margin-top:3px;">Booking update</div>
      </td>
    </tr>
    <tr>
      <td style="padding:28px;">
        <div style="color:${tone};font-size:22px;font-weight:700;margin:0 0 10px;">${escape(heading)}</div>
        <p style="margin:0 0 22px;color:${C.dim};font-size:14px;line-height:1.6;">${intro}</p>
        ${body}
      </td>
    </tr>
    <tr>
      <td style="padding:0 28px 26px;color:${C.dim};font-size:11px;line-height:1.6;border-top:1px solid ${C.rule};padding-top:18px;">
        This message confirms your reservation. It is not a boarding pass —
        collect that at check-in.
      </td>
    </tr>
  </table>
</div>`;

const button = (url: string, label: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 4px;">
    <tr><td style="background:${C.accent};border-radius:10px;">
      <a href="${escape(url)}" style="display:inline-block;padding:13px 24px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">${escape(label)}</a>
    </td></tr>
  </table>`;

const details = (input: PaymentEmailInput) => {
  const route = `${input.origin?.city ?? "—"} (${input.origin?.code ?? "—"}) → ${
    input.destination?.city ?? "—"
  } (${input.destination?.code ?? "—"})`;

  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    ${row("Booking reference", input.bookingRef)}
    ${row("Route", route)}
    ${row("Flight", input.flightNumber ?? "—")}
    ${row("Departure", formatDate(input.departureTime))}
    ${row("Arrival", formatDate(input.arrivalTime))}
    ${row("Cabin", input.cabin ?? "—")}
    ${row("Seats", input.seats.length ? input.seats.join(", ") : "Not assigned")}
    ${row("Travellers", String(input.travellerCount))}
    ${row("Total paid", formatMoney(input.amount, input.currency))}
  </table>`;
};

/** Plain-text alternative — some clients show it, and spam filters read it. */
const detailsText = (input: PaymentEmailInput) =>
  [
    `Booking reference: ${input.bookingRef}`,
    `Route: ${input.origin?.city ?? "—"} (${input.origin?.code ?? "—"}) to ${
      input.destination?.city ?? "—"
    } (${input.destination?.code ?? "—"})`,
    `Flight: ${input.flightNumber ?? "—"}`,
    `Departure: ${formatDate(input.departureTime)}`,
    `Arrival: ${formatDate(input.arrivalTime)}`,
    `Cabin: ${input.cabin ?? "—"}`,
    `Seats: ${input.seats.length ? input.seats.join(", ") : "Not assigned"}`,
    `Travellers: ${input.travellerCount}`,
    `Total paid: ${formatMoney(input.amount, input.currency)}`,
  ].join("\n");

export const paymentConfirmedEmail = (input: PaymentEmailInput) => ({
  subject: `Booking confirmed — ${input.bookingRef}`,
  html: shell(
    "Your booking is confirmed",
    C.success,
    `Thanks, ${escape(input.recipientName)} — your payment went through and your seats are held. ` +
      `Your e-ticket is ready to download from your bookings.`,
    details(input) + button(input.bookingsUrl, "View booking & download ticket")
  ),
  text: [
    `Hi ${input.recipientName},`,
    ``,
    `Your payment went through and your booking is confirmed.`,
    ``,
    detailsText(input),
    ``,
    `Download your e-ticket: ${input.bookingsUrl}`,
    ``,
    `This message confirms your reservation. It is not a boarding pass — collect that at check-in.`,
  ].join("\n"),
});

export const paymentFailedEmail = (input: PaymentEmailInput) => ({
  subject: `Payment unsuccessful — ${input.bookingRef}`,
  html: shell(
    "Your payment was not successful",
    C.danger,
    `Hi ${escape(input.recipientName)} — we couldn't process your payment, so this booking has been cancelled. ` +
      `No further charge has been made.<br /><br /><strong>Reason:</strong> ${escape(
        input.reason || "Please contact support."
      )}`,
    details(input) + button(input.bookingsUrl, "Try booking again")
  ),
  text: [
    `Hi ${input.recipientName},`,
    ``,
    `We couldn't process your payment, so this booking has been cancelled.`,
    `No further charge has been made.`,
    ``,
    `Reason: ${input.reason || "Please contact support."}`,
    ``,
    detailsText(input),
    ``,
    `Book again: ${input.bookingsUrl}`,
  ].join("\n"),
});
