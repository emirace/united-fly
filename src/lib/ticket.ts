/**
 * Flattens a populated booking into everything the printable ticket needs.
 *
 * The ticket is rasterised by html2canvas, so it gets one shot at rendering —
 * a thrown TypeError halfway through produces a blank or half-drawn PDF rather
 * than a React error boundary. Every field is therefore resolved and defaulted
 * here, and the component that renders it does no optional chaining at all.
 *
 * Dates and numbers go through `Intl`, never `moment`. MomentLocale sets
 * moment's locale *globally*, so `moment().format()` returns Arabic-Indic
 * digits (٢٠٢٦, ١٤:٣٠) once a visitor switches to Arabic. A ticket is read by
 * gate agents and filed with expense claims, so its dates, times, fares and
 * references stay in Latin digits in every language — hence `-u-nu-latn`.
 */
import type { IBooking } from "@/context/booking";
import type { IAirport } from "@/context/airport";

const DASH = "—";

export interface TicketFare {
  amount: number;
  currency: string;
}

export interface TicketPassenger {
  name: string;
  seat: string;
}

export interface TicketData {
  reference: string;
  status: string;
  paymentStatus: string;
  cabinKey: string;
  flightNumber: string;
  originCode: string;
  originCity: string;
  originName: string;
  destinationCode: string;
  destinationCity: string;
  destinationName: string;
  departure: string;
  arrival: string;
  duration: string;
  passengers: TicketPassenger[];
  /** Set only when seats couldn't be matched to travellers one-to-one. */
  seatSummary?: string;
  fare?: string;
  issued: string;
}

/**
 * `flightId` is typed non-nullable but Mongoose populate yields `null` for a
 * booking whose flight has since been deleted — there is at least one in the
 * live data. And on the admin screens the API doesn't populate the nested
 * airports, so `origin`/`destination` are ObjectId *strings* at runtime while
 * TypeScript insists they're `IAirport`. Both have to be narrowed by shape.
 */
const asObject = <T>(value: unknown): T | undefined =>
  value && typeof value === "object" ? (value as T) : undefined;

/** Gates the download button; an unticketable booking never reaches capture. */
export const isTicketable = (booking?: IBooking | null): boolean =>
  !!booking?.bookingId && !!asObject(booking.flightId);

const dateTime = (locale: string, value?: string) => {
  if (!value) return DASH;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return DASH;
  return new Intl.DateTimeFormat(`${locale}-u-nu-latn`, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const dateOnly = (locale: string, value: Date) =>
  new Intl.DateTimeFormat(`${locale}-u-nu-latn`, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);

/** Minutes → "7h 45m" / "45m", in Latin digits regardless of locale. */
const durationLabel = (minutes?: number) => {
  if (!minutes || minutes <= 0) return DASH;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? (rest ? `${hours}h ${rest}m` : `${hours}h`) : `${rest}m`;
};

const money = (locale: string, fare?: TicketFare | null) => {
  if (!fare || typeof fare.amount !== "number") return undefined;
  try {
    return new Intl.NumberFormat(`${locale}-u-nu-latn`, {
      style: "currency",
      currency: fare.currency,
    }).format(fare.amount);
  } catch {
    // A currency that isn't a valid ISO 4217 code throws RangeError.
    return `${fare.currency ?? ""} ${fare.amount.toFixed(2)}`.trim();
  }
};

export function buildTicketData(
  booking: IBooking,
  locale: string,
  fare?: TicketFare | null
): TicketData {
  const flight = asObject<IBooking["flightId"]>(booking.flightId);
  const origin = asObject<IAirport>(flight?.origin);
  const destination = asObject<IAirport>(flight?.destination);

  const travellers = Array.isArray(booking.travellers) ? booking.travellers : [];
  const seats = Array.isArray(booking.seatId) ? booking.seatId : [];

  // Seats are created in traveller order by processPayment, so index alignment
  // is the intended pairing. When the counts disagree — a partially cancelled
  // booking, or legacy data — pairing by index would put someone in the wrong
  // seat, so drop to a summary line instead of guessing.
  const aligned = seats.length === travellers.length;

  const passengers: TicketPassenger[] = travellers.map((traveller, index) => ({
    name:
      [traveller?.title, traveller?.firstName, traveller?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || DASH,
    seat: aligned ? seats[index]?.seatNumber || DASH : DASH,
  }));

  return {
    reference: booking.bookingId || DASH,
    status: booking.status || DASH,
    paymentStatus: booking.paymentStatus || DASH,
    cabinKey: booking.class || "",
    flightNumber: flight?.flightNumber || DASH,
    originCode: origin?.code || DASH,
    originCity: origin?.city || DASH,
    originName: origin?.name || "",
    destinationCode: destination?.code || DASH,
    destinationCity: destination?.city || DASH,
    destinationName: destination?.name || "",
    departure: dateTime(locale, flight?.departureTime),
    arrival: dateTime(locale, flight?.arrivalTime),
    duration: durationLabel(flight?.duration),
    passengers,
    seatSummary:
      !aligned && seats.length
        ? seats.map((seat) => seat.seatNumber).join(", ")
        : undefined,
    fare: money(locale, fare),
    issued: dateOnly(locale, new Date()),
  };
}

/** `BOOK-c076a13b` → `ticket-BOOK-c076a13b.pdf`. */
export const ticketFileName = (reference: string): string => {
  const safe = (reference || "").replace(/[^A-Za-z0-9._-]/g, "");
  return `ticket-${safe || "booking"}.pdf`;
};
