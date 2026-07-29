"use client";

import moment from "moment";
import Link from "next/link";
import { IFlight, useFlight } from "@/context/flight";
import { formatDuration } from "@/utils";
import { Eyebrow } from "@/components/ui";

const FareSummary = ({ flight }: { flight: IFlight | null }) => {
  const { formData } = useFlight();

  const total =
    flight?.price && formData.type === "Round Trip"
      ? flight.price * 2
      : flight?.price;

  return (
    <aside className="overflow-hidden rounded-card border border-line bg-raised lg:sticky lg:top-6">
      <div className="border-b border-line-soft px-6 py-5">
        <Eyebrow className="mb-3.5">Fare summary</Eyebrow>
        <div className="mb-2.5 flex justify-between text-sm">
          <span className="text-muted">Base fare</span>
          <span>${total}</span>
        </div>
        <div className="mb-2.5 flex justify-between text-sm">
          <span className="text-muted">Discount</span>
          <span className="text-success">$0</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Other services</span>
          <span>$0</span>
        </div>
      </div>

      <div className="flex items-baseline justify-between px-6 py-5">
        <span className="text-sm text-muted">Total due</span>
        <span className="font-display text-3xl font-semibold tracking-[-0.02em]">
          ${total}
        </span>
      </div>

      <div className="border-t border-line-soft px-6 py-5">
        <Eyebrow className="mb-3.5">Your booking</Eyebrow>
        <div className="mb-1 font-display text-base font-semibold">
          {flight?.origin?.city} → {flight?.destination?.city}
        </div>
        <div className="text-[13px] text-dim">
          {moment(flight?.departureTime).format("D MMM")} ·{" "}
          {formatDuration(flight?.duration || 0)} ·{" "}
          {formData.class || "Economy"}
        </div>
      </div>

      <div className="border-t border-line-soft px-6 py-5">
        <Eyebrow className="mb-3.5">Travellers</Eyebrow>
        {formData.travellersInfo.map((traveller) => (
          <div key={traveller.id} className="mb-3 last:mb-0">
            <div className="text-sm font-medium">
              {traveller.title} {traveller.firstName} {traveller.lastName}
            </div>
            <div className="mt-0.5 text-[13px] text-dim">
              Adult · {traveller.nationality || "—"} · {traveller.dob.day}{" "}
              {traveller.dob.month} {traveller.dob.year}
            </div>
          </div>
        ))}
        {formData.seats.length > 0 && (
          <div className="mt-3 font-mono text-xs text-accent-bright">
            Seats {formData.seats.join(", ")}
          </div>
        )}
      </div>

      <div className="border-t border-line-soft px-6 py-5">
        <Link
          href="/booking"
          className="text-sm font-medium text-accent-tint transition-colors hover:text-accent-bright"
        >
          Review booking
        </Link>
      </div>
    </aside>
  );
};

export default FareSummary;
