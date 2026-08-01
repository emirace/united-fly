"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSeats } from "@/services/flight";
import { useFlight } from "@/context/flight";
import Loading from "@/components/common/loading";
import { Button, Eyebrow } from "@/components/ui";
import { cn } from "@/lib/cn";

interface Seat {
  id: string;
  isAvailable: boolean;
}

export interface ISeat {
  flightId: string;
  seatNumber: string;
  class: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FlightSeatSelectionProps {
  totalRows?: number;
  seatsPerRow?: number;
  /** Share of the cabin shown as taken before real bookings. 0 disables it. */
  occupancy?: number;
  onSubmit: (selectedSeats: string[]) => void;
}

/**
 * djb2 followed by murmur3's finaliser. The mixing step is not optional here:
 * every input shares the long `<flightId>:` prefix and differs only in the last
 * two characters, so raw djb2 comes out ordered almost lexicographically —
 * ranking by it hands back A1, A2, A3… as one solid block at the front of the
 * cabin, identical on every flight. The avalanche breaks that up.
 */
const hash = (value: string) => {
  let h = 5381;
  for (let i = 0; i < value.length; i++) {
    h = ((h << 5) + h + value.charCodeAt(i)) | 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
};

/**
 * A flight that has sold two seats renders an empty cabin, which reads as
 * broken rather than available. This fills it out to `occupancy`.
 *
 * Seeding off the flight id is what makes it usable: the same flight shows the
 * same taken seats on every render, reload and device, so a seat can't turn
 * grey under a customer who is mid-choice, and two people comparing screens see
 * the same cabin.
 *
 * The filler is derived from the flight alone and real bookings union on top,
 * rather than being counted against the target. Budgeting them would mean a
 * seat shown as taken turning free again the moment somebody books elsewhere.
 */
const unavailableSeats = (
  seatIds: string[],
  bookedNumbers: string[],
  flightId: string,
  occupancy: number
) => {
  if (occupancy <= 0) return new Set(bookedNumbers);

  // Never fill the whole cabin — there has to be something left to pick.
  const target = Math.min(
    Math.round(seatIds.length * occupancy),
    seatIds.length - 1
  );

  const filler = seatIds
    .map((id) => ({ id, rank: hash(`${flightId}:${id}`) }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, target)
    .map((seat) => seat.id);

  return new Set([...bookedNumbers, ...filler]);
};

const FlightSeatSelection: React.FC<FlightSeatSelectionProps> = ({
  totalRows = 6,
  seatsPerRow = 4,
  occupancy = 0.55,
  onSubmit,
}) => {
  const t = useTranslations("booking.seats");
  const { formData } = useFlight();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookedSeats, setBookedSeats] = useState<ISeat[]>([]);

  const bookedNumbers = bookedSeats.map((seat) => seat.seatNumber);

  const seatIds: string[] = [];
  for (let row = 1; row <= totalRows; row++) {
    for (let col = 1; col <= seatsPerRow; col++) {
      seatIds.push(`${String.fromCharCode(65 + row - 1)}${col}`);
    }
  }

  const takenSeats = unavailableSeats(
    seatIds,
    bookedNumbers,
    formData.flightId,
    occupancy
  );

  const seats: Seat[] = seatIds.map((id) => ({
    id,
    isAvailable: !takenSeats.has(id),
  }));

  const handleSelect = (seatId: string) => {
    if (takenSeats.has(seatId)) return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  useEffect(() => {
    const loadSeats = async () => {
      try {
        setLoading(true);
        const res = await getSeats(formData.flightId);
        setBookedSeats(res);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    loadSeats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <Eyebrow>{t("heading")}</Eyebrow>
        <div className="flex flex-wrap gap-4 text-xs text-dim">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-accent" />
            {t("selected")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm border border-white/25" />
            {t("free")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-white/15" />
            {t("taken")}
          </span>
        </div>
      </div>

      <div
        className="mx-auto grid w-fit gap-2"
        style={{ gridTemplateColumns: `repeat(${seatsPerRow}, 1fr)` }}
      >
        {seats.map((seat) => {
          const taken = !seat.isAvailable;
          const chosen = selectedSeats.includes(seat.id);
          return (
            <button
              key={seat.id}
              onClick={() => handleSelect(seat.id)}
              disabled={taken}
              className={cn(
                "flex size-12 items-center justify-center rounded-lg font-mono text-xs transition-colors",
                taken && "cursor-not-allowed bg-white/15 text-faint",
                !taken && chosen && "cursor-pointer bg-accent text-white",
                !taken &&
                  !chosen &&
                  "cursor-pointer border border-white/25 text-muted hover:border-accent/60 hover:text-fg"
              )}
            >
              {seat.id}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-card border border-accent/28 bg-accent/8 p-4">
        <div className="font-display text-lg font-semibold">
          {selectedSeats.length > 0
            ? t("chosen", {
                count: selectedSeats.length,
                seats: selectedSeats.join(", "),
              })
            : t("none")}
        </div>
        <p className="m-0 mt-1 text-[13px] text-muted">
          {selectedSeats.length > 0 ? t("includedHint") : t("pickHint")}
        </p>
      </div>

      <Button
        className="mt-4 w-full"
        size="lg"
        onClick={() => onSubmit(selectedSeats)}
        disabled={selectedSeats.length === 0}
      >
        {t("proceed")}
      </Button>
    </div>
  );
};

export default FlightSeatSelection;
