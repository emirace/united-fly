"use client";

import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { FaTrash, FaEye } from "react-icons/fa";
import { usePayment, IPayment } from "@/context/payment";
import { IBooking } from "@/context/booking";
import type { TicketFare } from "@/lib/ticket";
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

/** Approve / reject control for a single payment row. */
function UpdateButton({ id, onDone }: { id: string; onDone: () => void }) {
  const { addNotification } = useToastNotification();
  const { updateStatus } = usePayment();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirm = async (status: string) => {
    try {
      setLoading(true);
      setShowReason(false);
      setShow(false);
      await updateStatus(id, status, reason);
      addNotification({ message: "Payment status updated" });
      onDone();
    } catch (error) {
      addNotification({ message: error as string, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setShow(!show)}
        disabled={loading}
        className="flex cursor-pointer items-center gap-2 text-accent-tint transition-colors hover:text-accent-bright"
      >
        {loading && <Loading size="sm" />}
        Edit
      </button>

      {show && (
        <div className="absolute top-full right-0 z-30 mt-1 flex w-max flex-col gap-1 rounded-card border border-line-strong bg-raised p-2 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)]">
          {showReason ? (
            <div className="flex items-center gap-2">
              <input
                className="w-40 rounded-control border border-line-strong bg-field px-3 py-1.5 text-sm outline-none focus:border-accent"
                placeholder="Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <button
                onClick={() => handleConfirm("failed")}
                className="cursor-pointer rounded-control border border-danger/40 px-3 py-1.5 text-xs text-danger"
              >
                Send
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => handleConfirm("successful")}
                disabled={loading}
                className="cursor-pointer rounded-control px-3 py-2 text-left text-sm text-success transition-colors hover:bg-success/10"
              >
                Mark confirmed
              </button>
              <button
                onClick={() => setShowReason(true)}
                className="cursor-pointer rounded-control px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger/10"
              >
                Mark failed
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function AllPayments() {
  const { fetchAllPayments } = usePayment();
  const { addNotification } = useToastNotification();
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<IBooking | null>(null);
  const [fare, setFare] = useState<TicketFare | null>(null);
  const [image, setImage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setPayments(await fetchAllPayments());
    } catch (error) {
      addNotification({ message: error as string, error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPayments = payments.filter((payment) =>
    payment.transactionId.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginated = filteredPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <PageHeader
        title="All payments"
        subtitle="Approve or reject customer transfers"
      />

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        placeholder="Search by transaction ID"
        count={payments.length}
        countLabel="payments"
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
              "Transaction ID",
              "Customer",
              "Booking ID",
              "Amount",
              "Currency",
              "Method",
              "Status",
              "Date",
              "Actions",
            ]}
            empty={filteredPayments.length === 0}
          >
            {paginated.map((payment, index) => (
              <Tr key={payment._id}>
                <Td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>
                <Td className="font-mono text-fg">{payment.transactionId}</Td>
                <Td>{payment.userId?.fullName || payment.userId?.email}</Td>
                <Td className="font-mono">{payment.bookingId?.bookingId}</Td>
                <Td className="text-fg">${payment.amount.toFixed(2)}</Td>
                <Td>{payment.currency}</Td>
                <Td>{payment.paymentMethod}</Td>
                <Td>
                  <StatusBadge status={payment.status} />
                </Td>
                <Td>
                  {moment(payment.createdAt).format("MMM D, YYYY HH:mm")}
                </Td>
                <Td>
                  <div className="flex items-center gap-4">
                    <FaEye
                      className="cursor-pointer transition-colors hover:text-fg"
                      onClick={() => {
                        setBooking(payment.bookingId);
                        setFare({
                          amount: payment.amount,
                          currency: payment.currency,
                        });
                        setImage(payment.image || "");
                        setIsOpen(true);
                      }}
                    />
                    <UpdateButton id={payment._id} onDone={loadPayments} />
                    <FaTrash className="cursor-not-allowed text-danger/40" />
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPayments.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onChange={setCurrentPage}
          />
        </>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <BookingDetails booking={booking} image={image} fare={fare} />
      </Modal>
    </div>
  );
}
