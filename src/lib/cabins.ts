/**
 * Cabin classes are persisted on the booking and sent to the API, so the stored
 * value stays English forever. Only the label shown to the traveller is
 * translated — which means anywhere that renders `formData.class` has to map it
 * back through here rather than printing the raw value.
 */
export const cabinValues = [
  "Economy",
  "Premium Economy",
  "Business",
  "First Class",
] as const;

export type CabinValue = (typeof cabinValues)[number];

export const cabinKeys: Record<CabinValue, string> = {
  Economy: "economy",
  "Premium Economy": "premiumEconomy",
  Business: "business",
  "First Class": "firstClass",
};

/**
 * Maps a stored cabin value to its message key, falling back to Economy for
 * bookings written before a value existed.
 */
export const cabinKeyFor = (value?: string): string =>
  cabinKeys[(value as CabinValue) ?? "Economy"] ?? "economy";
