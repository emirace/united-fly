"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoAirplaneOutline } from "react-icons/io5";
import { IFlight, useFlight } from "@/context/flight";
import { useAirport } from "@/context/airport";
import { useToastNotification } from "@/context/toastNotification";
import Loading from "@/components/common/loading";
import { Button, Field, Input } from "@/components/ui";
import SelectMenu from "@/components/ui/select-menu";

interface FlightFormProps {
  onClose: () => void;
  flight?: IFlight;
}

const DATE_INPUT_CLASS =
  "w-full rounded-control border border-line-strong bg-field px-4 py-3 text-sm text-fg outline-none transition-colors focus:border-accent";

const FlightForm: React.FC<FlightFormProps> = ({ onClose }) => {
  const { createFlight } = useFlight();
  const { addNotification } = useToastNotification();
  const { airports } = useAirport();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    departureTime: null as Date | null,
    arrivalTime: null as Date | null,
    price: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const airportOptions = (exclude: string) =>
    airports
      .filter((airport) => airport._id !== exclude)
      .map((airport) => ({
        label: `${airport.city} (${airport.code})`,
        value: airport._id!,
        hint: airport.name,
      }));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.origin.trim()) newErrors.origin = "Origin is required";
    if (!formData.destination.trim())
      newErrors.destination = "Destination is required";
    if (!formData.departureTime)
      newErrors.departureTime = "Departure time is required";
    if (!formData.arrivalTime)
      newErrors.arrivalTime = "Arrival time is required";
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = "Price must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createFlight({
        origin: formData.origin,
        destination: formData.destination,
        departureTime: formData.departureTime?.toISOString() || "",
        arrivalTime: formData.arrivalTime?.toISOString() || "",
        price: Number(formData.price),
      });
      setFormData({
        origin: "",
        destination: "",
        departureTime: null,
        arrivalTime: null,
        price: "",
      });
      addNotification({ message: "Flight created successfully" });
      onClose();
    } catch (error) {
      console.error("Error creating flight:", error);
      addNotification({ message: error as string, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="m-0 mb-5 font-display text-2xl font-semibold">
        Create flight
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Origin" error={errors.origin}>
          <SelectMenu
            options={airportOptions(formData.destination)}
            placeholder="Select origin airport"
            onChange={(value) => setFormData({ ...formData, origin: value })}
            value={formData.origin}
          />
        </Field>

        <Field label="Destination" error={errors.destination}>
          <SelectMenu
            options={airportOptions(formData.origin)}
            placeholder="Select destination airport"
            onChange={(value) =>
              setFormData({ ...formData, destination: value })
            }
            value={formData.destination}
          />
        </Field>

        <Field label="Departure time" error={errors.departureTime}>
          <DatePicker
            selected={formData.departureTime}
            onChange={(date: Date | null) =>
              setFormData({ ...formData, departureTime: date })
            }
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className={DATE_INPUT_CLASS}
            placeholderText="Select departure time"
          />
        </Field>

        <Field label="Arrival time" error={errors.arrivalTime}>
          <DatePicker
            selected={formData.arrivalTime}
            onChange={(date: Date | null) =>
              setFormData({ ...formData, arrivalTime: date })
            }
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className={DATE_INPUT_CLASS}
            placeholderText="Select arrival time"
          />
        </Field>

        <Field label="Price ($)" error={errors.price}>
          <Input
            type="number"
            name="price"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            placeholder="412"
          />
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loading color="border-white" size="sm" />}
          Create flight
          <IoAirplaneOutline />
        </Button>
      </form>
    </div>
  );
};

export default FlightForm;
