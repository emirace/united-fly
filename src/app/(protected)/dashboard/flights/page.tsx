"use client";

import React, { useEffect, useState } from "react";
import moment from "moment";
import { FaTrash } from "react-icons/fa";
import { IFlight, useFlight } from "@/context/flight";
import { useToastNotification } from "@/context/toastNotification";
import { formatDuration } from "@/utils";
import Modal from "@/components/common/modal";
import Loading from "@/components/common/loading";
import FlightForm from "@/components/dashboard/flightForm";
import {
  PageHeader,
  Pagination,
  SearchBar,
  StatusBadge,
  Table,
  Td,
  Tr,
} from "@/components/dashboard/table";
import { Button } from "@/components/ui";

const ITEMS_PER_PAGE = 5;

export default function Flights() {
  const { flights, fetchFlights, removeFlight } = useFlight();
  const { addNotification } = useToastNotification();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<IFlight>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlights = async () => {
      try {
        setLoading(true);
        await fetchFlights({});
      } catch (error) {
        console.error("Error fetching flights:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredFlights = flights.filter((flight) =>
    flight.flightNumber.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredFlights.length / ITEMS_PER_PAGE);
  const paginated = filteredFlights.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const close = () => {
    setSelectedFlight(undefined);
    setIsOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Flights"
        subtitle="Schedule and price the routes you sell"
        action={<Button onClick={() => setIsOpen(true)}>Add flight</Button>}
      />

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        placeholder="Search by flight number"
        count={flights.length}
        countLabel="flights"
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
              "Flight",
              "Origin",
              "Destination",
              "Departure",
              "Arrival",
              "Duration",
              "Seats",
              "Status",
              "Price",
              "Actions",
            ]}
            empty={filteredFlights.length === 0}
          >
            {paginated.map((flight, index) => (
              <Tr key={flight._id}>
                <Td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>
                <Td className="font-mono text-fg">{flight.flightNumber}</Td>
                <Td>
                  {flight.origin?.city} ({flight.origin?.code})
                </Td>
                <Td>
                  {flight.destination?.city} ({flight.destination?.code})
                </Td>
                <Td>
                  {moment(flight.departureTime).format("MMM D, YYYY HH:mm")}
                </Td>
                <Td>
                  {moment(flight.arrivalTime).format("MMM D, YYYY HH:mm")}
                </Td>
                <Td>{formatDuration(flight.duration)}</Td>
                <Td>{flight.availableSeats}</Td>
                <Td>
                  <StatusBadge status={flight.status} />
                </Td>
                <Td className="text-fg">${flight.price.toFixed(2)}</Td>
                <Td>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setSelectedFlight(flight);
                        setIsOpen(true);
                      }}
                      className="cursor-pointer text-accent-tint transition-colors hover:text-accent-bright"
                    >
                      Edit
                    </button>
                    <FaTrash
                      onClick={async () => {
                        await removeFlight(flight._id!);
                        addNotification({ message: "Flight removed" });
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
            totalItems={filteredFlights.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onChange={setCurrentPage}
          />
        </>
      )}

      <Modal isOpen={isOpen} onClose={close}>
        <FlightForm flight={selectedFlight} onClose={close} />
      </Modal>
    </div>
  );
}
