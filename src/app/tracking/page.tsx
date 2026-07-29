"use client";

import React, { useState } from "react";
import moment from "moment";
import { IBooking } from "@/context/booking";
import { getBookingByBookingId } from "@/services/booking";
import { useToastNotification } from "@/context/toastNotification";
import { formatDuration } from "@/utils";
import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";
import { Button, Eyebrow, Panel, Pill, StatusDot } from "@/components/ui";

const statusTone = (status: string) => {
  const value = (status || "").toLowerCase();
  if (["confirmed", "checked-in", "completed"].includes(value)) return "success";
  if (value === "cancelled") return "danger";
  return "gold";
};

export default function Tracking() {
  const [reference, setReference] = useState("");
  const { addNotification } = useToastNotification();
  const [booking, setBooking] = useState<IBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!reference) {
      setError("Please enter your booking reference.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await getBookingByBookingId(reference);
      setBooking(res);
    } catch {
      addNotification({ message: "Booking not found!", error: true });
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const flight = booking?.flightId;

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Navbar compact />

      <div className="mx-auto max-w-[1040px] px-4 pt-12 pb-20 md:px-12">
        <h1 className="m-0 mb-2.5 text-4xl font-semibold tracking-[-0.035em] md:text-[46px]">
          Where&apos;s my flight?
        </h1>
        <p className="m-0 mb-7 text-[15px] text-dim">
          Enter your booking reference. No account needed.
        </p>

        <div className="mb-9 flex flex-col gap-2.5 sm:flex-row">
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="BOOK-1A2B3C4D"
            className="flex-1 rounded-[14px] border border-line-strong bg-raised px-5 py-4 font-mono text-lg tracking-[0.14em] text-fg uppercase outline-none transition-colors focus:border-accent"
          />
          <Button
            size="lg"
            className="rounded-[14px] px-7"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching…" : "Track booking"}
          </Button>
        </div>

        {error && <p className="mb-6 text-sm text-danger">{error}</p>}

        {booking && flight && (
          <>
            <div className="overflow-hidden rounded-panel border border-line bg-panel">
              <div className="flex flex-wrap items-center justify-between gap-5 border-b border-line-soft px-6 py-5">
                <div className="flex flex-wrap items-center gap-3.5">
                  <Pill tone={statusTone(booking.status)}>
                    <StatusDot tone={statusTone(booking.status)} pulse />
                    <span className="capitalize">{booking.status}</span>
                  </Pill>
                  <span className="font-mono text-[13px] text-dim">
                    {flight.flightNumber} · {booking.class}
                  </span>
                </div>
                <span className="font-mono text-xs text-faint">
                  Ref {booking.bookingId}
                </span>
              </div>

              <div className="px-6 py-8">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <div className="font-display text-4xl leading-none font-semibold tracking-[-0.03em] md:text-[44px]">
                      {flight.origin?.code}
                    </div>
                    <div className="mt-2 text-[13px] text-dim">
                      Departs {moment(flight.departureTime).format("HH:mm")} ·{" "}
                      {flight.origin?.city}
                    </div>
                  </div>

                  <div className="pb-1.5 text-center">
                    <div className="font-mono text-xs text-success">
                      {formatDuration(flight.duration)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-display text-4xl leading-none font-semibold tracking-[-0.03em] md:text-[44px]">
                      {flight.destination?.code}
                    </div>
                    <div className="mt-2 text-[13px] text-dim">
                      Arrives {moment(flight.arrivalTime).format("HH:mm")} ·{" "}
                      {flight.destination?.city}
                    </div>
                  </div>
                </div>

                <div className="relative h-0.5 rounded-sm bg-white/10">
                  <div className="absolute top-0 left-0 h-0.5 w-1/2 rounded-sm bg-linear-to-r from-accent/40 to-accent" />
                  <span className="absolute top-0 left-0 size-2.5 -translate-y-1 rounded-full bg-accent" />
                  <span className="absolute top-1/2 left-1/2 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-[11px] shadow-[0_0_0_6px_rgba(110,91,245,0.15)]">
                    ✈
                  </span>
                  <span className="absolute top-0 right-0 size-2.5 -translate-y-1 rounded-full border border-white/30 bg-panel" />
                </div>

                <div className="mt-3.5 flex flex-wrap justify-between gap-3 font-mono text-[11px] text-faint">
                  <span>
                    {moment(flight.departureTime).format("ddd D MMM YYYY")}
                  </span>
                  <span>Flight {flight.flightNumber}</span>
                  <span className="capitalize">Status {flight.status}</span>
                </div>
              </div>

              <div className="grid border-t border-line-soft hairline-grid md:grid-cols-3">
                <div className="bg-panel px-6 py-5">
                  <Eyebrow className="mb-3.5">Travellers</Eyebrow>
                  {booking.travellers?.length ? (
                    booking.travellers.map((traveller, index) => (
                      <div key={index} className="mb-1 text-[15px] font-medium">
                        {traveller.title} {traveller.firstName}{" "}
                        {traveller.lastName}
                      </div>
                    ))
                  ) : (
                    <div className="text-[13px] text-dim">
                      No traveller details on file
                    </div>
                  )}
                </div>

                <div className="bg-panel px-6 py-5">
                  <Eyebrow className="mb-3.5">Payment</Eyebrow>
                  <div className="mb-1 text-[15px] font-medium capitalize">
                    {booking.paymentStatus}
                  </div>
                  <div className="text-[13px] text-dim">
                    Booked {moment(booking.createdAt).format("D MMM YYYY")}
                  </div>
                </div>

                <div className="bg-panel px-6 py-5">
                  <Eyebrow className="mb-3.5">Seats</Eyebrow>
                  {booking.seatId?.length ? (
                    booking.seatId.map((seat, index) => (
                      <div key={index} className="mb-1 text-[15px] font-medium">
                        {seat.seatNumber}{" "}
                        <span className="text-[13px] text-dim">
                          ({seat.class})
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[13px] text-dim">No seats assigned</div>
                  )}
                </div>
              </div>
            </div>

            <Panel className="mt-4 flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <div className="text-sm text-muted">
                Questions about this booking? Our support desk is open 24/7.
              </div>
              <Button variant="white" size="sm">
                Contact support
              </Button>
            </Panel>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
