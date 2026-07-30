"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import moment from "moment";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FaRegCalendar,
  FaUsers,
  FaRegIdBadge,
  FaRegUser,
  FaRegCreditCard,
  FaRegMoneyBill1,
} from "react-icons/fa6";
import { getPaymentById } from "@/services/payment";
import { IPayment } from "@/context/payment";
import { useToastNotification } from "@/context/toastNotification";
import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";
import Loading from "@/components/common/loading";
import DownloadTicketButton from "@/components/ticket/downloadTicketButton";
import { Button, Eyebrow, Pill, StatusDot, Stepper } from "@/components/ui";

const statusTone = (status: string) => {
  if (status === "successful" || status === "completed") return "success";
  if (status === "failed" || status === "rejected") return "danger";
  return "gold";
};

function ConfirmationBody() {
  const t = useTranslations("confirm");
  const searchParams = useSearchParams();
  const { addNotification } = useToastNotification();
  const paymentId = searchParams?.get("paymentId");

  const [payment, setPayment] = useState<IPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(true);
  const [status, setStatus] = useState("pending");

  const loadData = useCallback(async () => {
    try {
      if (!paymentId) return;
      const res = await getPaymentById(paymentId);
      setPayment(res);
      setStatus(res?.status || "pending");
      setConfirming(res?.status === "pending");
    } catch (error) {
      addNotification({ message: error as string, error: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    fetchData();
  }, [loadData]);

  // Keep polling until an admin approves or rejects the payment.
  useEffect(() => {
    const timer = setInterval(loadData, 10000);
    return () => clearInterval(timer);
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loading />
      </div>
    );
  }

  const flight = payment?.bookingId?.flightId;

  const rows = [
    {
      icon: FaRegIdBadge,
      key: "bookingId",
      value: payment?.bookingId?.bookingId,
      mono: true,
    },
    {
      icon: FaRegUser,
      key: "bookedBy",
      value: payment?.userId?.fullName || payment?.userId?.email,
    },
    {
      icon: FaRegCreditCard,
      key: "paymentMethod",
      value: payment?.paymentMethod,
    },
    {
      icon: FaRegMoneyBill1,
      key: "totalPrice",
      value: `${payment?.currency} ${payment?.amount}`,
    },
    {
      icon: FaRegCalendar,
      key: "dateBooked",
      value: payment && moment(payment.bookingId?.createdAt).calendar(),
    },
    {
      icon: FaRegCalendar,
      key: "departure",
      value: flight && moment(flight.departureTime).calendar(),
    },
    {
      icon: FaUsers,
      key: "guests",
      value: payment?.bookingId?.travellers?.length,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-12">
      <div className="overflow-hidden rounded-panel border border-line bg-panel">
        <div className="border-b border-line-soft px-7 py-8 text-center">
          <Pill tone={statusTone(status)} className="mb-4">
            <StatusDot tone={statusTone(status)} pulse={confirming} />
            <span className="capitalize">{status}</span>
          </Pill>

          <h1 className="m-0 mb-2.5 text-3xl font-semibold capitalize md:text-[40px]">
            {confirming ? t("confirming") : t("paymentStatus", { status })}
          </h1>
          <p className="m-0 text-sm leading-relaxed text-dim">{t("copy")}</p>

          {flight && (
            <h2 className="m-0 mt-5 font-display text-xl font-semibold text-accent-bright">
              {flight.origin?.city} → {flight.destination?.city}
            </h2>
          )}
        </div>

        <div className="grid hairline-grid sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4 bg-panel px-6 py-4"
            >
              <span className="flex items-center gap-2.5 text-[13px] text-dim">
                <row.icon className="text-faint" />
                {t("rows." + row.key)}
              </span>
              <span
                className={`text-end text-sm font-medium ${
                  row.mono ? "font-mono" : ""
                }`}
              >
                {row.value ?? "—"}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-soft px-6 py-5">
          <Eyebrow>{confirming ? t("autoUpdates") : t("resolved")}</Eyebrow>
          <div className="flex flex-wrap items-center gap-3">
            {/* Only once the payment has actually been approved — a ticket for
                a rejected payment would be worse than no ticket. */}
            {status === "successful" && payment?.bookingId && (
              <DownloadTicketButton
                booking={payment.bookingId}
                fare={{ amount: payment.amount, currency: payment.currency }}
                size="md"
              />
            )}
            <Link href="/dashboard/bookings">
              <Button>{t("goToBookings")}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmation() {
  const t = useTranslations("confirm");

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
        current={4}
      />
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <Loading />
          </div>
        }
      >
        <ConfirmationBody />
      </Suspense>
      <Footer />
    </div>
  );
}
