"use client";

import React, { useEffect, useState } from "react";
import moment from "moment";
import { usePayment, IPayment } from "@/context/payment";
import { useToastNotification } from "@/context/toastNotification";
import Loading from "@/components/common/loading";
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

export default function Payments() {
  const { fetchUserPayments } = usePayment();
  const { addNotification } = useToastNotification();
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        setPayments(await fetchUserPayments());
      } catch (error) {
        addNotification({ message: error as string, error: true });
      } finally {
        setLoading(false);
      }
    };
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
      <PageHeader title="Payments" subtitle="Receipts for every booking" />

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
              "Booking ID",
              "Amount",
              "Currency",
              "Method",
              "Status",
              "Date",
            ]}
            empty={filteredPayments.length === 0}
          >
            {paginated.map((payment, index) => (
              <Tr key={payment._id}>
                <Td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>
                <Td className="font-mono text-fg">{payment.transactionId}</Td>
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
    </div>
  );
}
