"use client";

import React from "react";
import moment from "moment";
import { IBooking } from "@/context/booking";
import { Eyebrow, Panel } from "@/components/ui";
import { StatusBadge } from "./table";

interface BookingDetailsProps {
  booking?: IBooking | null;
  image?: string;
}

const Row = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 border-b border-line-soft py-2.5 last:border-b-0">
    <span className="text-[13px] text-dim">{label}</span>
    <span className="text-right text-sm font-medium break-words">
      {value ?? "—"}
    </span>
  </div>
);

const BookingDetails: React.FC<BookingDetailsProps> = ({ booking, image }) => {
  if (!booking) return null;

  const flight = booking.flightId;

  return (
    <div className="space-y-5">
      <div>
        <Eyebrow className="mb-2">Booking</Eyebrow>
        <h2 className="m-0 font-display text-2xl font-semibold">
          {booking.bookingId}
        </h2>
      </div>

      <Panel className="px-5 py-1">
        <Row label="Status" value={<StatusBadge status={booking.status} />} />
        <Row
          label="Payment status"
          value={<StatusBadge status={booking.paymentStatus} />}
        />
        <Row label="Class" value={booking.class} />
        <Row
          label="Created"
          value={moment(booking.createdAt).format("D MMM YYYY, HH:mm")}
        />
      </Panel>

      {flight && (
        <div>
          <Eyebrow className="mb-2.5">Flight</Eyebrow>
          <Panel className="px-5 py-1">
            <Row label="Flight number" value={flight.flightNumber} />
            <Row
              label="Origin"
              value={`${flight.origin?.city} (${flight.origin?.code})`}
            />
            <Row
              label="Destination"
              value={`${flight.destination?.city} (${flight.destination?.code})`}
            />
            <Row
              label="Departure"
              value={moment(flight.departureTime).format("D MMM YYYY, HH:mm")}
            />
            <Row
              label="Arrival"
              value={moment(flight.arrivalTime).format("D MMM YYYY, HH:mm")}
            />
            <Row
              label="Flight status"
              value={<StatusBadge status={flight.status} />}
            />
          </Panel>
        </div>
      )}

      <div>
        <Eyebrow className="mb-2.5">Seats</Eyebrow>
        <Panel className="px-5 py-1">
          {booking.seatId?.length ? (
            booking.seatId.map((seat, index) => (
              <Row
                key={index}
                label={`Seat ${index + 1}`}
                value={`${seat.seatNumber} (${seat.class})`}
              />
            ))
          ) : (
            <Row label="Seats" value="None assigned" />
          )}
        </Panel>
      </div>

      {image && (
        <div>
          <Eyebrow className="mb-2.5">Payment receipt</Eyebrow>
          <img
            src={image}
            alt="Payment receipt"
            className="max-h-96 w-full rounded-card border border-line object-contain"
          />
        </div>
      )}

      <div>
        <Eyebrow className="mb-2.5">Travellers</Eyebrow>
        <div className="space-y-3">
          {booking.travellers?.map((traveller, index) => (
            <Panel key={index} className="px-5 py-1">
              <Row
                label="Name"
                value={`${traveller.title || ""} ${traveller.firstName || ""} ${
                  traveller.lastName || ""
                }`.trim()}
              />
              <Row
                label="Date of birth"
                value={
                  traveller.dob
                    ? `${traveller.dob.day || "—"}/${
                        traveller.dob.month || "—"
                      }/${traveller.dob.year || "—"}`
                    : "—"
                }
              />
              <Row label="Nationality" value={traveller.nationality} />
              <Row label="Passport" value={traveller.passportNumber} />
              <Row label="Issuing country" value={traveller.passportCountry} />
              <Row label="Expiry" value={traveller.passportExpiry} />
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
