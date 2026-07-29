"use client";

import React, { useEffect, useState } from "react";
import { IAirport, useAirport } from "@/context/airport";
import { useToastNotification } from "@/context/toastNotification";
import Loading from "@/components/common/loading";
import { Button, Field, Input } from "@/components/ui";

interface AirportFormProps {
  onClose: () => void;
  airport?: IAirport;
}

const AirportForm: React.FC<AirportFormProps> = ({ onClose, airport }) => {
  const { addAirport, editAirport } = useAirport();
  const { addNotification } = useToastNotification();
  const [loading, setLoading] = useState(false);
  const isEditing = !!airport;

  const [formData, setFormData] = useState<
    Omit<IAirport, "createdAt" | "updatedAt">
  >({ name: "", code: "", city: "", country: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (airport) {
      setFormData({
        name: airport.name,
        code: airport.code,
        city: airport.city,
        country: airport.country,
      });
    }
  }, [airport]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Airport name is required";
    if (!formData.code) newErrors.code = "Airport code is required";
    else if (formData.code.length !== 3)
      newErrors.code = "Airport code must be exactly 3 letters";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.country) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      if (isEditing) {
        await editAirport(airport._id!, formData);
      } else {
        await addAirport(formData);
      }
      onClose();
      addNotification({
        message: isEditing ? "Airport updated" : "Airport created",
      });
    } catch (error) {
      addNotification({ message: error as string, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="m-0 mb-5 font-display text-2xl font-semibold">
        {isEditing ? "Edit airport" : "Create airport"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Airport name" error={errors.name}>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Murtala Muhammed International"
          />
        </Field>

        <Field label="Airport code (3 letters)" error={errors.code}>
          <Input
            type="text"
            name="code"
            maxLength={3}
            value={formData.code}
            onChange={handleChange}
            placeholder="LOS"
            className="font-mono uppercase"
          />
        </Field>

        <Field label="City" error={errors.city}>
          <Input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Lagos"
          />
        </Field>

        <Field label="Country" error={errors.country}>
          <Input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Nigeria"
          />
        </Field>

        <div className="mt-5 flex justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loading color="border-white" size="sm" />}
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AirportForm;
