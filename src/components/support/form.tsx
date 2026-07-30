"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { IUser, IGuestUser } from "@/types/user";
import { Button, Field, Input } from "@/components/ui";

interface FormProps {
  setScreen: (screen: string) => void;
  setUser: (value: IUser) => void;
  loginGuest: (value: IGuestUser) => Promise<void>;
}

const Form: React.FC<FormProps> = ({ setScreen, loginGuest }) => {
  const t = useTranslations("support.form");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState({
    fullName: "",
    email: "",
    error: "",
  });

  const handleContinue = async () => {
    try {
      setLoading(true);
      setFormError({ fullName: "", email: "", error: "" });

      if (fullName === "") {
        setFormError((prev) => ({ ...prev, fullName: t("errors.fullName") }));
        setLoading(false);
        return;
      }
      if (email === "") {
        setFormError((prev) => ({ ...prev, email: t("errors.email") }));
        setLoading(false);
        return;
      }

      await loginGuest({ email, fullName });
      setScreen("chat");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setFormError((prev) => ({ ...prev, error: error as string }));
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 scrollbar-slim">
      <p className="m-0 mb-5 text-[13px] leading-relaxed text-dim">
        {t("intro")}
      </p>

      <div className="space-y-4">
        <Field label={t("fullName")} error={formError.fullName}>
          <Input
            name="fullName"
            type="text"
            placeholder={t("fullNamePlaceholder")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </Field>

        <Field label={t("email")} error={formError.email}>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Button
          className="w-full"
          disabled={!email || !fullName || loading}
          onClick={handleContinue}
        >
          {loading ? t("starting") : t("continue")}
        </Button>

        {formError.error && (
          <div className="text-xs text-danger">{formError.error}</div>
        )}
      </div>
    </div>
  );
};

export default Form;
