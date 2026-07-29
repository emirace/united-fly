"use client";

import React, { useEffect, useState } from "react";
import moment from "moment";
import { FaTrash, FaEye } from "react-icons/fa";
import { IBooking, useBooking } from "@/context/booking";
import { useToastNotification } from "@/context/toastNotification";
import Loading from "@/components/common/loading";
import Modal from "@/components/common/modal";
import BookingDetails from "@/components/dashboard/bookingDetail";
import {
  PageHeader,
  Pagination,
  SearchBar,
  StatusBadge,
  Table,
  Td,
  Tr,
} from "@/components/dashboard/table";

const ITEMS_PER_PAGE = 5;

export default function AllBookings() {
  const { bookings, fetchBookings, cancelUserBooking } = useBooking();
  const { addNotification } = useToastNotification();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<IBooking | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        await fetchBookings();
      } catch (error) {
        addNotification({ message: error as string, error: true });
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.flightId?.flightNumber
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      booking.userId?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginated = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <PageHeader title="All bookings" subtitle="Every booking on the system" />

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        placeholder="Search by flight no. or passenger name"
        count={bookings.length}
        countLabel="bookings"
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loading />
        </div>
      ) : (
        <>
          <Table
            headers={[
              "#",
              "Booking ID",
              "Passenger",
              "Flight",
              "Class",
              "Seat",
              "Booking",
              "Payment",
              "Booked on",
              "Actions",
            ]}
            empty={filteredBookings.length === 0}
          >
            {paginated.map((booking, index) => (
              <Tr key={booking._id}>
                <Td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>
                <Td className="font-mono text-fg">{booking.bookingId}</Td>
                <Td>{booking.userId?.fullName}</Td>
                <Td className="font-mono">{booking.flightId?.flightNumber}</Td>
                <Td>{booking.class}</Td>
                <Td className="font-mono">
                  {booking.seatId?.map((seat) => seat.seatNumber).join(", ")}
                </Td>
                <Td>
                  <StatusBadge status={booking.status} />
                </Td>
                <Td>
                  <StatusBadge status={booking.paymentStatus} />
                </Td>
                <Td>
                  {moment(booking.createdAt).format("MMM D, YYYY HH:mm")}
                </Td>
                <Td>
                  <div className="flex items-center gap-4">
                    <FaEye
                      className="cursor-pointer transition-colors hover:text-fg"
                      onClick={() => setSelected(booking)}
                    />
                    <FaTrash
                      onClick={async () => {
                        await cancelUserBooking(booking._id);
                        addNotification({ message: "Booking cancelled" });
                      }}
                      className="cursor-pointer text-danger transition-opacity hover:opacity-70"
                    />
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredBookings.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onChange={setCurrentPage}
          />
        </>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)}>
        <BookingDetails booking={selected} />
      </Modal>
    </div>
  );
}
