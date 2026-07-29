"use client";

import React, { useState } from "react";
import moment from "moment";
import { FaTrash } from "react-icons/fa";
import { IAirport, useAirport } from "@/context/airport";
import { useToastNotification } from "@/context/toastNotification";
import Modal from "@/components/common/modal";
import Loading from "@/components/common/loading";
import AirportForm from "@/components/dashboard/airportForm";
import {
  PageHeader,
  Pagination,
  SearchBar,
  Table,
  Td,
  Tr,
} from "@/components/dashboard/table";
import { Button } from "@/components/ui";

const ITEMS_PER_PAGE = 5;

export default function Airports() {
  const { airports, loading, removeAirport } = useAirport();
  const { addNotification } = useToastNotification();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<IAirport>();

  const filteredAirports = airports.filter((airport) =>
    airport.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredAirports.length / ITEMS_PER_PAGE);
  const paginated = filteredAirports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const close = () => {
    setSelectedAirport(undefined);
    setIsOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Airports"
        subtitle="The network your flights can be scheduled between"
        action={<Button onClick={() => setIsOpen(true)}>Add airport</Button>}
      />

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        placeholder="Search airports"
        count={airports.length}
        countLabel="airports"
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loading />
        </div>
      ) : (
        <>
          <Table
            headers={["#", "Code", "Name", "City", "Country", "Added", "Actions"]}
            empty={filteredAirports.length === 0}
          >
            {paginated.map((airport, index) => (
              <Tr key={airport._id || airport.code}>
                <Td>
                  {String(
                    (currentPage - 1) * ITEMS_PER_PAGE + index + 1
                  ).padStart(2, "0")}
                </Td>
                <Td className="font-mono text-fg">{airport.code}</Td>
                <Td className="text-fg">{airport.name}</Td>
                <Td>{airport.city}</Td>
                <Td>{airport.country}</Td>
                <Td>{moment(airport.createdAt).calendar()}</Td>
                <Td>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setSelectedAirport(airport);
                        setIsOpen(true);
                      }}
                      className="cursor-pointer text-accent-tint transition-colors hover:text-accent-bright"
                    >
                      Edit
                    </button>
                    <FaTrash
                      onClick={async () => {
                        await removeAirport(airport._id!);
                        addNotification({ message: "Airport removed" });
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
            totalItems={filteredAirports.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onChange={setCurrentPage}
          />
        </>
      )}

      <Modal isOpen={isOpen} onClose={close}>
        <AirportForm onClose={close} airport={selectedAirport} />
      </Modal>
    </div>
  );
}
