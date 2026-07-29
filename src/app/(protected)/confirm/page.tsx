"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import moment from "moment";
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
import { Button, Eyebrow, Pill, StatusDot, Stepper } from "@/components/ui";

const statusTone = (status: string) => {
  if (status === "successful" || status === "completed") return "success";
  if (status === "failed" || status === "rejected") return "danger";
  return "gold";
};

function ConfirmationBody() {
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
      label: "Booking ID",
      value: payment?.bookingId?.bookingId,
      mono: true,
    },
    {
      icon: FaRegUser,
      label: "Booked by",
      value: payment?.userId?.fullName || payment?.userId?.email,
    },
    {
      icon: FaRegCreditCard,
      label: "Payment method",
      value: payment?.paymentMethod,
    },
    {
      icon: FaRegMoneyBill1,
      label: "Total price",
      value: `${payment?.currency} ${payment?.amount}`,
    },
    {
      icon: FaRegCalendar,
      label: "Date booked",
      value: payment && moment(payment.bookingId?.createdAt).calendar(),
    },
    {
      icon: FaRegCalendar,
      label: "Departure",
      value: flight && moment(flight.departureTime).calendar(),
    },
    {
      icon: FaUsers,
      label: "Guests",
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
            {confirming ? "Confirming payment" : `Payment ${status}`}
          </h1>
          <p className="m-0 text-sm leading-relaxed text-dim">
            Your flight has been booked. We&apos;ll email you as soon as the
            payment is confirmed.
          </p>

          {flight && (
            <h2 className="m-0 mt-5 font-display text-xl font-semibold text-accent-bright">
              {flight.origin?.city} → {flight.destination?.city}
            </h2>
          )}
        </div>

        <div className="grid hairline-grid sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 bg-panel px-6 py-4"
            >
              <span className="flex items-center gap-2.5 text-[13px] text-dim">
                <row.icon className="text-faint" />
                {row.label}
              </span>
              <span
                className={`text-right text-sm font-medium ${
                  row.mono ? "font-mono" : ""
                }`}
              >
                {row.value ?? "—"}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-soft px-6 py-5">
          <Eyebrow>
            {confirming
              ? "This page updates automatically"
              : "Payment resolved"}
          </Eyebrow>
          <Link href="/dashboard/bookings">
            <Button>Go to my bookings</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmation() {
  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Navbar compact />
      <Stepper
        steps={["Search", "Passengers & seats", "Payment", "Ticket issued"]}
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
