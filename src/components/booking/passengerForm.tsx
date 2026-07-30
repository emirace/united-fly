"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useFlight } from "@/context/flight";
import { Eyebrow, Field, Input, Label, Select } from "@/components/ui";
import CountrySelect from "./countrySelect";

/**
 * Titles and months are persisted on the booking and sent to the API, so the
 * stored value stays English while only the visible label is translated.
 */
const titles = ["Mr", "Mrs", "Ms", "Dr"] as const;
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const PassengerForm: React.FC = () => {
  const t = useTranslations("booking.passenger");
  const { formData, updateFormData } = useFlight();

  const handleChange = (id: number, field: string, value: string) => {
    updateFormData({
      travellersInfo: formData.travellersInfo.map((passenger) =>
        passenger.id === id ? { ...passenger, [field]: value } : passenger
      ),
    });
  };

  const handleDOBChange = (id: number, field: string, value: string) => {
    updateFormData({
      travellersInfo: formData.travellersInfo.map((passenger) =>
        passenger.id === id
          ? { ...passenger, dob: { ...passenger.dob, [field]: value } }
          : passenger
      ),
    });
  };

  const addPassenger = () => {
    updateFormData({
      travellersInfo: [
        ...formData.travellersInfo,
        {
          id: formData.travellersInfo.length + 1,
          title: "Mr",
          firstName: "",
          lastName: "",
          dob: { day: "", month: "", year: "" },
          nationality: "",
          passportNumber: "",
          passportCountry: "",
          passportExpiry: "",
          expanded: true,
        },
      ],
    });
  };

  const toggleExpand = (id: number) => {
    updateFormData({
      travellersInfo: formData.travellersInfo.map((p) =>
        p.id === id ? { ...p, expanded: !p.expanded } : p
      ),
    });
  };

  return (
    <div>
      {formData.travellersInfo.map((passenger) => (
        <div
          key={passenger.id}
          className="mb-3 overflow-hidden rounded-card border border-line"
        >
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-between bg-white/3 px-5 py-4 text-start"
            onClick={() => toggleExpand(passenger.id)}
          >
            <Eyebrow>
              {t("heading", { number: passenger.id })}
              {passenger.firstName ? ` · ${passenger.firstName}` : ""}
            </Eyebrow>
            <span className="text-lg text-faint">
              {passenger.expanded ? "−" : "+"}
            </span>
          </button>

          {passenger.expanded && (
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <Field label={t("title")}>
                <Select
                  value={passenger.title}
                  onChange={(e) =>
                    handleChange(passenger.id, "title", e.target.value)
                  }
                >
                  {titles.map((value) => (
                    <option key={value} value={value}>
                      {t("titles." + value.toLowerCase())}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label={t("firstName")}
                className="sm:col-span-1 lg:col-span-2"
              >
                <Input
                  type="text"
                  placeholder={t("firstNamePlaceholder")}
                  value={passenger.firstName}
                  onChange={(e) =>
                    handleChange(passenger.id, "firstName", e.target.value)
                  }
                />
              </Field>

              <Field label={t("lastName")}>
                <Input
                  type="text"
                  placeholder={t("lastNamePlaceholder")}
                  value={passenger.lastName}
                  onChange={(e) =>
                    handleChange(passenger.id, "lastName", e.target.value)
                  }
                />
              </Field>

              <div className="sm:col-span-2">
                <Label>{t("dob")}</Label>
                <div className="grid grid-cols-3 gap-2.5">
                  <Input
                    type="number"
                    placeholder="DD"
                    value={passenger.dob.day}
                    onChange={(e) =>
                      handleDOBChange(passenger.id, "day", e.target.value)
                    }
                  />
                  <Select
                    value={passenger.dob.month}
                    onChange={(e) =>
                      handleDOBChange(passenger.id, "month", e.target.value)
                    }
                  >
                    <option value="">{t("month")}</option>
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {t("months." + m.toLowerCase())}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    placeholder="YYYY"
                    value={passenger.dob.year}
                    onChange={(e) =>
                      handleDOBChange(passenger.id, "year", e.target.value)
                    }
                  />
                </div>
              </div>

              <Field label={t("nationality")}>
                <CountrySelect
                  passenger={passenger}
                  id="nationality"
                  handleChange={handleChange}
                />
              </Field>

              <Field label={t("passportCountry")}>
                <CountrySelect
                  passenger={passenger}
                  id="passportCountry"
                  handleChange={handleChange}
                />
              </Field>

              <Field
                label={t("passportNumber")}
                className="sm:col-span-2 lg:col-span-2"
              >
                <Input
                  type="text"
                  placeholder="A01234567"
                  className="font-mono"
                  value={passenger.passportNumber}
                  onChange={(e) =>
                    handleChange(passenger.id, "passportNumber", e.target.value)
                  }
                />
                <p className="mt-1.5 text-xs text-faint">
                  {t("passportHint")}
                </p>
              </Field>

              <Field label={t("passportExpiry")} className="lg:col-span-2">
                <Input
                  type="date"
                  value={passenger.passportExpiry}
                  onChange={(e) =>
                    handleChange(passenger.id, "passportExpiry", e.target.value)
                  }
                />
              </Field>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addPassenger}
        className="cursor-pointer rounded-control border border-dashed border-line-strong px-4 py-2.5 text-[13px] text-accent-bright transition-colors hover:border-accent/50"
      >
        {t("addTraveller")}
      </button>
    </div>
  );
};

export default PassengerForm;
