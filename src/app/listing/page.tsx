"use client";

import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFlight, IFlight } from "@/context/flight";
import { useAirport } from "@/context/airport";
import { formatDuration } from "@/utils";
import { cabinKeyFor } from "@/lib/cabins";
import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";
import SearchPanel from "@/components/home/searchPanel";
import Loading from "@/components/common/loading";
import { Button, Eyebrow, Stepper } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useLatinEyebrow } from "@/lib/eyebrow";

type SortKey = "best" | "cheapest" | "fastest";

const sortKeys: SortKey[] = ["best", "cheapest", "fastest"];

function FlightCard({ flight, index }: { flight: IFlight; index: number }) {
  const t = useTranslations("listing");
  const latinEyebrow = useLatinEyebrow();
  const tc = useTranslations("common");
  const { formData, updateFormData } = useFlight();
  const router = useRouter();

  const handleBooking = (id: string) => {
    updateFormData({ flightId: id });
    router.push("/booking");
  };

  const best = index === 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-card border",
        best
          ? "border-accent/40 bg-linear-120 from-accent/8 to-panel"
          : "border-line bg-panel"
      )}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-line-soft px-6 py-2.5">
        {best && (
          <span
            className={cn(
              "rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold text-white",
              latinEyebrow && "tracking-[0.1em] uppercase"
            )}
          >
            {t("bestValue")}
          </span>
        )}
        <span className="font-mono text-[11px] text-dim">
          {flight.flightNumber} · {tc(`cabins.${cabinKeyFor(formData.class)}`)}
        </span>
        <span className="ms-auto text-xs text-success capitalize">
          {flight.status}
        </span>
      </div>

      <div className="grid items-center gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(190px,240px)]">
        <div className="flex min-w-0 flex-wrap items-center gap-4 md:gap-6">
          <div>
            <div className="font-display text-2xl font-semibold tracking-[-0.02em] md:text-[30px]">
              {moment(flight.departureTime).format("HH:mm")}
            </div>
            <div className="mt-1 font-mono text-xs text-dim">
              {flight.origin?.code} · {t("terminal", { number: 2 })}
            </div>
            <div className="mt-0.5 text-xs text-faint">
              {flight.origin?.city}, {flight.origin?.country}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 basis-[130px] flex-col items-center gap-1.5">
            <div className="font-mono text-xs whitespace-nowrap text-dim">
              {formatDuration(flight.duration)} · {t("direct")}
            </div>
            <div className="relative h-px w-full bg-linear-to-r from-white/10 via-accent to-white/10">
              <span className="absolute -top-1.5 left-1/2 size-3.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_0_4px_rgba(110,91,245,0.18)]" />
            </div>
            <div className="text-[11px] text-faint">{t("cabinBag")}</div>
          </div>

          <div className="text-end">
            <div className="font-display text-2xl font-semibold tracking-[-0.02em] md:text-[30px]">
              {moment(flight.arrivalTime).format("HH:mm")}
            </div>
            <div className="mt-1 font-mono text-xs text-dim">
              {flight.destination?.code} · {t("terminal", { number: 5 })}
            </div>
            <div className="mt-0.5 text-xs text-faint">
              {flight.destination?.city}, {flight.destination?.country}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 lg:border-s lg:border-line lg:ps-7">
          <div className="text-end">
            <div className="font-display text-[32px] font-semibold tracking-[-0.02em]">
              ${flight.price}
            </div>
            <div className="text-xs text-faint">{t("perAdult")}</div>
          </div>
          <Button
            variant={best ? "primary" : "outline"}
            onClick={() => handleBooking(flight._id!)}
          >
            {t("selectFlight")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/3 px-6 py-3 text-xs">
        <span className="text-gold">
          {t("seatsLeft", { count: flight.availableSeats })}
        </span>
        <span className="text-dim">{t("refundable")}</span>
      </div>
    </div>
  );
}

export default function Listing() {
  const t = useTranslations("listing");
  const tc = useTranslations("common");
  const { flights, loading, formData, fetchFlights } = useFlight();
  const { airports } = useAirport();
  const [sort, setSort] = useState<SortKey>("best");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchFlights({
      origin: formData.from,
      destination: formData.to,
      departureTime: formData.date,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.from, formData.to, formData.date]);

  const sorted = useMemo(() => {
    const list = [...flights];
    if (sort === "cheapest") return list.sort((a, b) => a.price - b.price);
    if (sort === "fastest") return list.sort((a, b) => a.duration - b.duration);
    // "Best" balances price against duration.
    return list.sort(
      (a, b) => a.price + a.duration / 60 - (b.price + b.duration / 60)
    );
  }, [flights, sort]);

  const codeFor = (id: string) =>
    airports.find((airport) => airport._id === id)?.code;

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Navbar compact />

      <Stepper
        steps={[
          t("steps.search"),
          t("steps.review"),
          t("steps.passengers"),
          t("steps.payment"),
        ]}
        current={2}
      />

      <div className="flex flex-wrap items-center gap-4 border-b border-line-soft px-4 py-5 md:px-12">
        <div className="flex flex-wrap items-center gap-3 rounded-btn border border-line-strong bg-raised px-4 py-2.5">
          <span className="font-display text-base font-semibold">
            {codeFor(formData.from) || "—"} → {codeFor(formData.to) || "—"}
          </span>
          <span className="h-3.5 w-px bg-white/15" />
          <span className="text-[13px] text-dim">
            {formData.date
              ? moment(formData.date).format("ddd D MMM")
              : t("anyDate")}{" "}
            · {t("adultCount", { count: formData.travelers })} ·{" "}
            {tc(`cabins.${cabinKeyFor(formData.class)}`)}
          </span>
          <button
            onClick={() => setEditing(!editing)}
            className="ms-2 cursor-pointer rounded-control border border-line-strong px-3 py-1.5 text-xs text-accent-bright transition-colors hover:border-accent/50"
          >
            {editing ? t("close") : t("edit")}
          </button>
        </div>
      </div>

      {editing && (
        <div className="px-4 pt-6 md:px-12">
          <SearchPanel
            submitLabel={t("updateSearch")}
            onSubmitted={() => setEditing(false)}
          />
        </div>
      )}

      <div className="px-4 pt-8 pb-16 md:px-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="m-0 font-display text-2xl font-semibold tracking-[-0.03em] md:text-[34px]">
              {t("flightsAvailable", { count: flights.length })}
            </h1>
            <p className="m-0 mt-1.5 text-sm text-dim">
              {formData.date
                ? moment(formData.date).format("dddd, D MMMM YYYY")
                : t("allDates")}{" "}
              · {t("pricesInclude")}
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            {sortKeys.map((key) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={cn(
                  "cursor-pointer rounded-control border px-4 py-2 text-[13px] transition-colors",
                  sort === key
                    ? "border-accent/50 bg-accent/12 text-accent-bright"
                    : "border-line-strong text-dim hover:text-fg"
                )}
              >
                {t("sort." + key)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loading />
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-card border border-line bg-panel px-6 py-16 text-center">
            <Eyebrow className="mb-3">{t("empty.title")}</Eyebrow>
            <p className="m-0 text-dim">{t("empty.copy")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((flight, index) => (
              <FlightCard key={flight._id} flight={flight} index={index} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
