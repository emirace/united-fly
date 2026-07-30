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
  onSubmit: (selectedSeats: string[]) => void;
}

const FlightSeatSelection: React.FC<FlightSeatSelectionProps> = ({
  totalRows = 6,
  seatsPerRow = 4,
  onSubmit,
}) => {
  const t = useTranslations("booking.seats");
  const { formData } = useFlight();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookedSeats, setBookedSeats] = useState<ISeat[]>([]);

  const bookedNumbers = bookedSeats.map((seat) => seat.seatNumber);

  const seats: Seat[] = [];
  for (let row = 1; row <= totalRows; row++) {
    for (let col = 1; col <= seatsPerRow; col++) {
      const id = `${String.fromCharCode(65 + row - 1)}${col}`;
      seats.push({ id, isAvailable: !bookedNumbers.includes(id) });
    }
  }

  const handleSelect = (seatId: string) => {
    if (bookedNumbers.includes(seatId)) return;

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
