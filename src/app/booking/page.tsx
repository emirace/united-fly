"use client";

import { useEffect, useState } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IFlight, useFlight } from "@/context/flight";
import { useUser } from "@/context/user";
import { useToastNotification } from "@/context/toastNotification";
import { formatDuration } from "@/utils";
import { cabinKeyFor } from "@/lib/cabins";
import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";
import Loading from "@/components/common/loading";
import Modal from "@/components/common/modal";
import PassengerForm from "@/components/booking/passengerForm";
import FlightSeatSelection from "@/components/booking/seatSelection";
import {
  Button,
  Eyebrow,
  Field,
  Input,
  Panel,
  Pill,
  Stepper,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { useLatinEyebrow } from "@/lib/eyebrow";

const importantInfoKeys = ["names", "entry", "cancellation", "baggage"] as const;

export default function Booking() {
  const t = useTranslations("booking");
  const latinEyebrow = useLatinEyebrow();
  const tc = useTranslations("common");
  const { getFlight, formData, updateFormData } = useFlight();
  const { user } = useUser();
  const { addNotification } = useToastNotification();
  const router = useRouter();

  const [flight, setFlight] = useState<IFlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadFlight = async () => {
      if (!formData.flightId) {
        router.back();
        return;
      }
      try {
        setLoading(true);
        setError("");
        setFlight(await getFlight(formData.flightId));
      } catch (err) {
        setError(err as string);
      } finally {
        setLoading(false);
      }
    };
    loadFlight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.flightId]);

  const handleContinue = () => {
    if (!formData.email) {
      addNotification({ message: t("errors.email"), error: true });
      return;
    }
    if (!formData.phone) {
      addNotification({ message: t("errors.phone"), error: true });
      return;
    }
    setIsOpen(true);
  };

  const handleSeatSubmit = (selectedSeats: string[]) => {
    updateFormData({ seats: selectedSeats });
    if (!user) {
      router.push(`/login?redirect=/booking`);
      return;
    }
    router.push("/payment");
  };

  const total =
    flight && formData.type === "Round Trip" ? flight.price * 2 : flight?.price;

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Navbar compact />
      <Stepper
        steps={[
          t("steps.search"),
          t("steps.passengers"),
          t("steps.payment"),
          t("steps.issued"),
        ]}
        current={2}
      />

      {loading ? (
        <div className="flex justify-center py-24">
          <Loading />
        </div>
      ) : error ? (
        <div className="px-4 py-24 text-center text-danger md:px-12">
          {error}
        </div>
      ) : (
        flight && (
          <div className="grid items-start gap-5 px-4 py-9 pb-16 md:px-12 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
            <main className="flex flex-col gap-4">
              <div>
                <h1 className="m-0 mb-2 text-3xl font-semibold tracking-[-0.035em] md:text-[40px]">
                  {flight.origin?.city} → {flight.destination?.city}
                </h1>
                <p className="m-0 text-sm text-dim">
                  {moment(flight.departureTime).format("ddd D MMM YYYY")} ·{" "}
                  {formatDuration(flight.duration)} ·{" "}
                  {tc(`cabins.${cabinKeyFor(formData.class)}`)}
                </p>
              </div>

              {/* Itinerary ------------------------------------------- */}
              <Panel className="p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <Eyebrow>
                    {t("itinerary", { flight: flight.flightNumber })}
                  </Eyebrow>
                  <Pill tone="success">
                    {t("seatsAvailable", { count: flight.availableSeats })}
                  </Pill>
                </div>

                <div className="grid grid-cols-[70px_1fr] gap-0 md:grid-cols-[120px_1fr]">
                  <div className="font-display text-xl font-semibold md:text-2xl">
                    {moment(flight.departureTime).format("HH:mm")}
                  </div>
                  <div className="relative border-s border-line-strong pb-6 ps-6">
                    <span className="absolute top-2 -start-[5px] size-2.5 rounded-full bg-accent" />
                    <div className="text-[15px] font-medium">
                      {flight.origin?.city} · {flight.origin?.name} (
                      {flight.origin?.code})
                    </div>
                    <div className="mt-1 text-[13px] text-dim">
                      {flight.origin?.country} ·{" "}
                      {moment(flight.departureTime).format("ddd D MMM")}
                    </div>
                  </div>

                  <div className="pt-1 font-mono text-xs text-faint">
                    {formatDuration(flight.duration)}
                  </div>
                  <div className="border-s border-line-strong pb-6 ps-6 text-[13px] text-dim">
                    {t("flightIncludes", { flight: flight.flightNumber })}
                  </div>

                  <div className="font-display text-xl font-semibold md:text-2xl">
                    {moment(flight.arrivalTime).format("HH:mm")}
                  </div>
                  <div className="relative ps-6">
                    <span className="absolute top-2 -start-[5px] size-2.5 rounded-full bg-fg" />
                    <div className="text-[15px] font-medium">
                      {flight.destination?.city} · {flight.destination?.name} (
                      {flight.destination?.code})
                    </div>
                    <div className="mt-1 text-[13px] text-dim">
                      {flight.destination?.country} ·{" "}
                      {moment(flight.arrivalTime).format("ddd D MMM")}
                    </div>
                  </div>
                </div>
              </Panel>

              {/* Travellers ------------------------------------------ */}
              <Panel className="p-6">
                <Eyebrow className="mb-5">{t("travellerDetails")}</Eyebrow>
                <div className="mb-5 flex items-center gap-3 rounded-control border border-gold/35 bg-gold/10 px-4 py-3 text-[13px] text-gold">
                  <span
                    className={cn(
                      "rounded bg-gold/25 px-2 py-0.5 text-[10px] font-semibold",
                      latinEyebrow && "tracking-[0.08em] uppercase"
                    )}
                  >
                    {t("new")}
                  </span>
                  {t("nameNotice")}
                </div>

                <PassengerForm />

                <div className="mt-7">
                  <Eyebrow className="mb-4">{t("sendTo")}</Eyebrow>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t("mobile")}>
                      <Input
                        type="text"
                        placeholder="+234 800 000 0000"
                        value={formData.phone}
                        onChange={(e) =>
                          updateFormData({ phone: e.target.value })
                        }
                      />
                    </Field>
                    <Field label={t("email")}>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          updateFormData({ email: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                </div>
              </Panel>

              {/* Before you continue --------------------------------- */}
              <Panel className="px-6 py-5">
                <Eyebrow className="mb-3.5">{t("beforeContinue")}</Eyebrow>
                <div className="grid gap-3 text-[13px] leading-relaxed text-muted sm:grid-cols-2 sm:gap-x-7">
                  {importantInfoKeys.map((key) => (
                    <div key={key}>{t("important." + key)}</div>
                  ))}
                </div>
              </Panel>
            </main>

            {/* Fare summary ------------------------------------------ */}
            <aside className="overflow-hidden rounded-card border border-line bg-raised lg:sticky lg:top-6">
              <div className="border-b border-line-soft px-6 py-5">
                <Eyebrow className="mb-3.5">{t("fare.title")}</Eyebrow>
                <div className="mb-2.5 flex justify-between text-sm">
                  <span className="text-muted">
                    {t("fare.baseFare", { count: formData.travelers })}
                  </span>
                  <span>${flight.price}</span>
                </div>
                <div className="mb-2.5 flex justify-between text-sm">
                  <span className="text-muted">{t("fare.taxes")}</span>
                  <span className="text-success">{t("fare.included")}</span>
                </div>
                <div className="mb-2.5 flex justify-between text-sm">
                  <span className="text-muted">{t("fare.seat")}</span>
                  <span className="text-success">{t("fare.included")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{t("fare.bag")}</span>
                  <span className="text-success">{t("fare.included")}</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between px-6 py-5">
                <span className="text-sm text-muted">{t("fare.total")}</span>
                <span className="font-display text-3xl font-semibold tracking-[-0.02em]">
                  ${total}
                </span>
              </div>

              <div className="px-6 pb-6">
                <Button size="lg" className="w-full" onClick={handleContinue}>
                  {t("continueToSeats")}
                </Button>
                <p className="m-0 mt-3 text-center text-xs leading-relaxed text-faint">
                  {t("noChargeYet")}
                </p>
              </div>

              <div className="border-t border-line-soft px-6 py-5">
                <Eyebrow className="mb-2.5">{t("cancellation.title")}</Eyebrow>
                <p className="m-0 text-[13px] leading-relaxed text-dim">
                  {t("cancellation.copy")}
                </p>
              </div>
            </aside>
          </div>
        )
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <FlightSeatSelection onSubmit={handleSeatSubmit} />
      </Modal>

      <Footer />
    </div>
  );
}
