"use client";

import React, { useState } from "react";
import { IUser, IGuestUser } from "@/types/user";
import { Button, Field, Input } from "@/components/ui";

interface FormProps {
  setScreen: (screen: string) => void;
  setUser: (value: IUser) => void;
  loginGuest: (value: IGuestUser) => Promise<void>;
}

const Form: React.FC<FormProps> = ({ setScreen, loginGuest }) => {
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
        setFormError((prev) => ({
          ...prev,
          fullName: "Please enter your full name",
        }));
        setLoading(false);
        return;
      }
      if (email === "") {
        setFormError((prev) => ({ ...prev, email: "Please enter your email" }));
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
        Tell us who you are and we&apos;ll pick up the conversation from any
        device.
      </p>

      <div className="space-y-4">
        <Field label="Full name" error={formError.fullName}>
          <Input
            name="fullName"
            type="text"
            placeholder="Ada Okonkwo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </Field>

        <Field label="Email address" error={formError.email}>
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
          {loading ? "Starting…" : "Continue"}
        </Button>

        {formError.error && (
          <div className="text-xs text-danger">{formError.error}</div>
        )}
      </div>
    </div>
  );
};

export default Form;
