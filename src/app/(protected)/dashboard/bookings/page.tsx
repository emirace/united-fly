"use client";

import { useEffect, useState } from "react";
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
import { useToastNotification } from "@/context/toastNotification";
import Loading from "@/components/common/loading";
import Modal from "@/components/common/modal";
import BookingDetails from "@/components/dashboard/bookingDetail";
import { PageHeader, StatusBadge } from "@/components/dashboard/table";
import { Button, Eyebrow, Panel } from "@/components/ui";
import { cn } from "@/lib/cn";

const tabItems = [
  { id: "pending", label: "Pending", icon: HiOutlineClock },
  { id: "confirmed", label: "Upcoming", icon: HiOutlineCalendar },
  { id: "cancelled", label: "Cancelled", icon: HiOutlineXCircle },
  { id: "completed", label: "Completed", icon: HiOutlineCheckCircle },
];

export default function Bookings() {
  const { fetchUserBookings, bookings, loading } = useBooking();
  const { addNotification } = useToastNotification();
  const [activeTab, setActiveTab] = useState("pending");
  const [selected, setSelected] = useState<IBooking | null>(null);

  useEffect(() => {
    fetchUserBookings().catch((error) =>
      addNotification({ message: error as string, error: true })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBookings = bookings.filter((b) => b.status === activeTab);

  return (
    <div>
      <PageHeader
        title="Your bookings"
        subtitle={`${bookings.length} total · ${filteredBookings.length} ${activeTab}`}
        action={
          <Link href="/">
            <Button>Book a flight</Button>
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
            <tab.icon size={16} /> {tab.label}
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
                  Manage booking
                </Button>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-3">
                <div>
                  <Eyebrow className="mb-1.5">Departure</Eyebrow>
                  <p className="m-0 text-sm font-medium">
                    {moment(booking.flightId?.departureTime).format(
                      "ddd DD MMM · HH:mm"
                    )}
                  </p>
                </div>
                <div>
                  <Eyebrow className="mb-1.5">Arrival</Eyebrow>
                  <p className="m-0 text-sm font-medium">
                    {moment(booking.flightId?.arrivalTime).format(
                      "ddd DD MMM · HH:mm"
                    )}
                  </p>
                </div>
                <div>
                  <Eyebrow className="mb-1.5">Seats</Eyebrow>
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
          <Eyebrow className="mb-3">Nothing here</Eyebrow>
          <p className="m-0 text-dim">No {activeTab} bookings available.</p>
        </Panel>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)}>
        <BookingDetails booking={selected} />
      </Modal>
    </div>
  );
}
