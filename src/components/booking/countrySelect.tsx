"use client";

import React, { useEffect, useRef, useState } from "react";
import { IPassenger } from "@/context/flight";
import { countries } from "@/lib/countries";

/**
 * Type-ahead country picker for the passport fields. Writes straight back into
 * the passenger record via `handleChange`, same contract as before.
 */
const CountrySelect: React.FC<{
  passenger: IPassenger;
  id: "nationality" | "passportCountry";
  handleChange: (id: number, field: string, value: string) => void;
}> = ({ passenger, handleChange, id }) => {
  const [search, setSearch] = useState(passenger[id] || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (selectedCountry: string) => {
    handleChange(passenger.id, id, selectedCountry);
    setSearch(selectedCountry);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        className="w-full rounded-control border border-line-strong bg-field px-4 py-3 text-sm text-fg outline-none transition-colors focus:border-accent"
        placeholder="Search country"
      />

      {showDropdown && filteredCountries.length > 0 && (
        <ul className="absolute z-30 mt-2 max-h-48 w-full overflow-y-auto rounded-card border border-line-strong bg-raised shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)] scrollbar-slim">
          {filteredCountries.map((country) => (
            <li
              key={country}
              onClick={() => handleSelect(country)}
              className="cursor-pointer px-4 py-2.5 text-sm text-muted transition-colors hover:bg-accent/12 hover:text-accent-bright"
            >
              {country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CountrySelect;
