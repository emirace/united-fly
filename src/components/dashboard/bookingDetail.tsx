"use client";

import React from "react";
import moment from "moment";
import { useTranslations } from "next-intl";
import { IBooking } from "@/context/booking";
import { Eyebrow, Panel } from "@/components/ui";
import DownloadTicketButton from "@/components/ticket/downloadTicketButton";
import type { TicketFare } from "@/lib/ticket";
import { StatusBadge } from "./table";

interface BookingDetailsProps {
  booking?: IBooking | null;
  image?: string;
  /** Only the screens that loaded a payment can supply this. */
  fare?: TicketFare | null;
  showDownload?: boolean;
}

const Row = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 border-b border-line-soft py-2.5 last:border-b-0">
    <span className="text-[13px] text-dim">{label}</span>
    <span className="text-end text-sm font-medium break-words">
      {value ?? "—"}
    </span>
  </div>
);

const BookingDetails: React.FC<BookingDetailsProps> = ({
  booking,
  image,
  fare,
  showDownload = true,
}) => {
  const t = useTranslations("bookingDetail");

  if (!booking) return null;

  const flight = booking.flightId;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 pe-8">
        <div>
          <Eyebrow className="mb-2">{t("booking")}</Eyebrow>
          <h2 className="m-0 font-display text-2xl font-semibold">
            {booking.bookingId}
          </h2>
        </div>
        {showDownload && <DownloadTicketButton booking={booking} fare={fare} />}
      </div>

      <Panel className="px-5 py-1">
        <Row label={t("status")} value={<StatusBadge status={booking.status} />} />
        <Row
          label={t("paymentStatus")}
          value={<StatusBadge status={booking.paymentStatus} />}
        />
        <Row label={t("class")} value={booking.class} />
        <Row
          label={t("created")}
          value={moment(booking.createdAt).format("D MMM YYYY, HH:mm")}
        />
      </Panel>

      {flight && (
        <div>
          <Eyebrow className="mb-2.5">{t("flight")}</Eyebrow>
          <Panel className="px-5 py-1">
            <Row label={t("flightNumber")} value={flight.flightNumber} />
            <Row
              label={t("origin")}
              value={`${flight.origin?.city} (${flight.origin?.code})`}
            />
            <Row
              label={t("destination")}
              value={`${flight.destination?.city} (${flight.destination?.code})`}
            />
            <Row
              label={t("departure")}
              value={moment(flight.departureTime).format("D MMM YYYY, HH:mm")}
            />
            <Row
              label={t("arrival")}
              value={moment(flight.arrivalTime).format("D MMM YYYY, HH:mm")}
            />
            <Row
              label={t("flightStatus")}
              value={<StatusBadge status={flight.status} />}
            />
          </Panel>
        </div>
      )}

      <div>
        <Eyebrow className="mb-2.5">{t("seats")}</Eyebrow>
        <Panel className="px-5 py-1">
          {booking.seatId?.length ? (
            booking.seatId.map((seat, index) => (
              <Row
                key={index}
                label={t("seatNumbered", { number: index + 1 })}
                value={`${seat.seatNumber} (${seat.class})`}
              />
            ))
          ) : (
            <Row label={t("seats")} value={t("noSeats")} />
          )}
        </Panel>
      </div>

      {image && (
        <div>
          <Eyebrow className="mb-2.5">{t("receipt")}</Eyebrow>
          <img
            src={image}
            alt={t("receipt")}
            className="max-h-96 w-full rounded-card border border-line object-contain"
          />
        </div>
      )}

      <div>
        <Eyebrow className="mb-2.5">{t("travellers")}</Eyebrow>
        <div className="space-y-3">
          {booking.travellers?.map((traveller, index) => (
            <Panel key={index} className="px-5 py-1">
              <Row
                label={t("name")}
                value={`${traveller.title || ""} ${traveller.firstName || ""} ${
                  traveller.lastName || ""
                }`.trim()}
              />
              <Row
                label={t("dob")}
                value={
                  traveller.dob
                    ? `${traveller.dob.day || "—"}/${
                        traveller.dob.month || "—"
                      }/${traveller.dob.year || "—"}`
                    : "—"
                }
              />
              <Row label={t("nationality")} value={traveller.nationality} />
              <Row label={t("passport")} value={traveller.passportNumber} />
              <Row
                label={t("issuingCountry")}
                value={traveller.passportCountry}
              />
              <Row label={t("expiry")} value={traveller.passportExpiry} />
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
