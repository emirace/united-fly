"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import { useFlight } from "@/context/flight";
import { useAirport } from "@/context/airport";
import { useToastNotification } from "@/context/toastNotification";
import { Eyebrow } from "@/components/ui";
import SelectMenu from "@/components/ui/select-menu";
import { cn } from "@/lib/cn";

const classes = [
  { label: "Economy", value: "Economy" },
  { label: "Premium Economy", value: "Premium Economy" },
  { label: "Business", value: "Business" },
  { label: "First Class", value: "First Class" },
];

const travelerOptions = [1, 2, 3, 4, 5].map((n) => ({
  label: `${n} ${n === 1 ? "traveller" : "travellers"}`,
  value: `${n}`,
}));

const tripTypes = ["One Way", "Round Trip"];

/**
 * The home search panel. Same validation and `formData` wiring as before —
 * only the presentation changed to the hairline grid from the design.
 */
export default function SearchPanel({
  submitLabel = "Search flights →",
  onSubmitted,
}: {
  submitLabel?: string;
  /** Called after validation passes, before navigating to the results. */
  onSubmitted?: () => void;
} = {}) {
  const { addNotification } = useToastNotification();
  const { airports } = useAirport();
  const router = useRouter();
  const { formData, updateFormData } = useFlight();

  const airportOptions = (exclude: string) =>
    airports
      .filter((airport) => airport._id !== exclude)
      .map((airport) => ({
        label: `${airport.city} (${airport.code})`,
        value: airport._id!,
        hint: airport.name,
      }));

  const codeFor = (id: string) =>
    airports.find((airport) => airport._id === id)?.code;

  const handleSubmit = () => {
    if (!formData.from) {
      addNotification({
        message: "Please select a departure location.",
        error: true,
      });
      return;
    }
    if (!formData.to) {
      addNotification({ message: "Please select a destination.", error: true });
      return;
    }
    if (!formData.date) {
      addNotification({
        message: "Please select a departure date.",
        error: true,
      });
      return;
    }
    if (!formData.class) {
      addNotification({ message: "Please select a travel class.", error: true });
      return;
    }
    if (!formData.travelers) {
      addNotification({
        message: "Please select the number of travelers.",
        error: true,
      });
      return;
    }

    onSubmitted?.();
    router.push("/listing");
  };

  const isRoundTrip = formData.type === "Round Trip";

  return (
    <div className="rounded-panel border border-line bg-raised p-2.5 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex flex-wrap items-center gap-2 px-2.5 pt-2 pb-3.5">
        {tripTypes.map((type) => (
          <button
            key={type}
            onClick={() => updateFormData({ type })}
            className={cn(
              "cursor-pointer rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
              formData.type === type
                ? "bg-accent text-white"
                : "border border-line-strong text-dim hover:text-fg"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "grid overflow-hidden rounded-card border border-line-soft hairline-grid",
          isRoundTrip
            ? "md:grid-cols-[1.1fr_1.1fr_1fr_1fr_.9fr_auto]"
            : "md:grid-cols-[1.2fr_1.2fr_1fr_.9fr_auto]"
        )}
      >
        <div className="bg-field px-4 py-4">
          <Eyebrow className="mb-2">From</Eyebrow>
          <div className="flex items-baseline gap-2">
            {codeFor(formData.from) && (
              <span className="font-display text-xl font-semibold tracking-[-0.02em]">
                {codeFor(formData.from)}
              </span>
            )}
            <SelectMenu
              bare
              options={airportOptions(formData.to)}
              placeholder="Select origin"
              onChange={(value) => updateFormData({ from: value })}
              value={formData.from}
            />
          </div>
        </div>

        <div className="bg-field px-4 py-4">
          <Eyebrow className="mb-2">To</Eyebrow>
          <div className="flex items-baseline gap-2">
            {codeFor(formData.to) && (
              <span className="font-display text-xl font-semibold tracking-[-0.02em]">
                {codeFor(formData.to)}
              </span>
            )}
            <SelectMenu
              bare
              options={airportOptions(formData.from)}
              placeholder="Select destination"
              onChange={(value) => updateFormData({ to: value })}
              value={formData.to}
            />
          </div>
        </div>

        <div className="bg-field px-4 py-4">
          <Eyebrow className="mb-2">Depart</Eyebrow>
          <DatePicker
            selected={formData.date ? new Date(formData.date) : null}
            onChange={(date: Date | null) =>
              updateFormData({ date: date?.toISOString() })
            }
            minDate={new Date()}
            dateFormat="EEE, d MMM"
            placeholderText="Select date"
            className="w-full bg-transparent text-base font-medium text-fg outline-none placeholder:text-faint"
          />
        </div>

        {isRoundTrip && (
          <div className="bg-field px-4 py-4">
            <Eyebrow className="mb-2">Return</Eyebrow>
            <DatePicker
              selected={
                formData.returnDate ? new Date(formData.returnDate) : null
              }
              onChange={(date: Date | null) =>
                updateFormData({ returnDate: date?.toISOString() })
              }
              minDate={formData.date ? new Date(formData.date) : new Date()}
              dateFormat="EEE, d MMM"
              placeholderText="Select date"
              className="w-full bg-transparent text-base font-medium text-fg outline-none placeholder:text-faint"
            />
          </div>
        )}

        <div className="bg-field px-4 py-4">
          <Eyebrow className="mb-2">Travellers</Eyebrow>
          <SelectMenu
            bare
            options={travelerOptions}
            placeholder="1 traveller"
            onChange={(value) => updateFormData({ travelers: parseFloat(value) })}
            value={`${formData.travelers}`}
          />
          <div className="mt-1">
            <SelectMenu
              bare
              className="[&_span]:text-xs [&_span]:font-normal"
              options={classes}
              placeholder="Select class"
              onChange={(value) => updateFormData({ class: value })}
              value={formData.class}
            />
          </div>
        </div>

        <div className="flex items-center bg-field p-3">
          <button
            onClick={handleSubmit}
            className="flex h-full w-full min-w-[150px] cursor-pointer items-center justify-center gap-2.5 rounded-btn bg-accent px-6 py-3.5 font-display text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            {submitLabel}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 px-3 pt-3.5 pb-2">
        <Eyebrow>Included</Eyebrow>
        {["24h free hold", "Taxes in fare", "No card to search"].map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-line-soft bg-white/5 px-3 py-1.5 font-mono text-xs text-muted"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
