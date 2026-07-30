"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import Link from "next/link";
import {
  HiOutlineCalendar,
  HiOutlineXCircle,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { HiOutlineClock } from "react-icons/hi2";
import { IoAirplane } from "react-icons/io5";
import { IBooking, useBooking } from "@/context/booking";
import { IPayment, usePayment } from "@/context/payment";
import { useToastNotification } from "@/context/toastNotification";
import Loading from "@/components/common/loading";
import Modal from "@/components/common/modal";
import BookingDetails from "@/components/dashboard/bookingDetail";
import DownloadTicketButton from "@/components/ticket/downloadTicketButton";
import { PageHeader, StatusBadge } from "@/components/dashboard/table";
import { Button, Eyebrow, Panel } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { TicketFare } from "@/lib/ticket";

const tabItems = [
  { id: "pending", icon: HiOutlineClock },
  { id: "confirmed", icon: HiOutlineCalendar },
  { id: "cancelled", icon: HiOutlineXCircle },
  { id: "completed", icon: HiOutlineCheckCircle },
];

export default function Bookings() {
  const t = useTranslations("dashboard.bookings");
  const { fetchUserBookings, bookings, loading } = useBooking();
  const { fetchUserPayments } = usePayment();
  const { addNotification } = useToastNotification();
  const [activeTab, setActiveTab] = useState("pending");
  const [selected, setSelected] = useState<IBooking | null>(null);
  const [payments, setPayments] = useState<IPayment[]>([]);

  useEffect(() => {
    fetchUserBookings().catch((error) =>
      addNotification({ message: error as string, error: true })
    );
    // The fare shown on a downloaded ticket lives on the payment, not the
    // booking. It is strictly a nice-to-have, so a failure here is swallowed —
    // the ticket simply omits the fare rather than the list failing to load.
    fetchUserPayments()
      .then(setPayments)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * A booking can carry several payment attempts — a failed one followed by a
   * successful one. Sorting so successful and newer attempts are written last
   * means the map ends up holding the one actually paid.
   */
  const fareByBooking = useMemo(() => {
    const map = new Map<string, TicketFare>();
    const ordered = [...payments].sort(
      (a, b) =>
        Number(a.status === "successful") - Number(b.status === "successful") ||
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    for (const payment of ordered) {
      const id =
        typeof payment.bookingId === "string"
          ? payment.bookingId
          : payment.bookingId?._id;
      if (id) map.set(id, { amount: payment.amount, currency: payment.currency });
    }
    return map;
  }, [payments]);

  const filteredBookings = bookings.filter((b) => b.status === activeTab);

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle", {
          total: bookings.length,
          shown: filteredBookings.length,
          status: t("tabs." + activeTab).toLowerCase(),
        })}
        action={
          <Link href="/">
            <Button>{t("bookFlight")}</Button>
          </Link>
        }
      />

      <div className="mb-6 flex gap-1.5 overflow-x-auto border-b border-line-soft scrollbar-slim">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex cursor-pointer items-center gap-2 border-b-2 px-4 pb-3 text-sm whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "border-accent text-accent-bright"
                : "border-transparent text-dim hover:text-fg"
            )}
          >
            <tab.icon size={16} /> {t("tabs." + tab.id)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loading />
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredBookings.map((booking) => (
            <Panel key={booking._id} className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-4 border-b border-line-soft p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-control border border-line-strong bg-field text-xl text-accent-tint">
                  <IoAirplane />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="m-0 font-display text-lg font-semibold">
                    {booking.flightId?.origin?.city} →{" "}
                    {booking.flightId?.destination?.city}
                  </h3>
                  <p className="m-0 mt-1 font-mono text-xs text-dim">
                    {booking.bookingId} · {booking.class}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(booking)}
                >
                  {t("manage")}
                </Button>
                <DownloadTicketButton
                  booking={booking}
                  fare={fareByBooking.get(booking._id)}
                />
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-3">
                <div>
                  <Eyebrow className="mb-1.5">{t("departure")}</Eyebrow>
                  <p className="m-0 text-sm font-medium">
                    {moment(booking.flightId?.departureTime).format(
                      "ddd DD MMM · HH:mm"
                    )}
                  </p>
                </div>
                <div>
                  <Eyebrow className="mb-1.5">{t("arrival")}</Eyebrow>
                  <p className="m-0 text-sm font-medium">
                    {moment(booking.flightId?.arrivalTime).format(
                      "ddd DD MMM · HH:mm"
                    )}
                  </p>
                </div>
                <div>
                  <Eyebrow className="mb-1.5">{t("seats")}</Eyebrow>
                  <p className="m-0 font-mono text-sm font-medium">
                    {booking.seatId?.map((s) => s.seatNumber).join(", ") || "—"}
                  </p>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <Panel className="px-6 py-16 text-center">
          <Eyebrow className="mb-3">{t("empty.title")}</Eyebrow>
          <p className="m-0 text-dim">
            {t("empty.copy", { status: t("tabs." + activeTab).toLowerCase() })}
          </p>
        </Panel>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)}>
        <BookingDetails
          booking={selected}
          fare={selected ? fareByBooking.get(selected._id) : undefined}
        />
      </Modal>
    </div>
  );
}
