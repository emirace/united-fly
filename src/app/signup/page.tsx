"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { registerUser } from "@/services/auth";
import { useToastNotification } from "@/context/toastNotification";
import AuthShell from "@/components/auth/authShell";
import Loading from "@/components/common/loading";
import { Button, Field, Input } from "@/components/ui";

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function SignUpForm() {
  const t = useTranslations("auth.signup");
  const router = useRouter();
  const { addNotification } = useToastNotification();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({
    fullName: null,
    email: null,
    password: null,
    confirmPassword: null,
    general: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: null });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({
      fullName: null,
      email: null,
      password: null,
      confirmPassword: null,
      general: null,
    });

    const newErrors: Record<string, string | null> = {};

    if (!formData.email.trim() || !validateEmail(formData.email)) {
      newErrors.email = t("errors.email");
    }
    if (!formData.password.trim() || formData.password.length < 8) {
      newErrors.password = t("errors.password");
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("errors.confirmPassword");
    }

    if (Object.values(newErrors).some((error) => error)) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      router.push(redirect || "/login");
    } catch (error) {
      setErrors((prev) => ({ ...prev, general: error as string }));
      addNotification({ message: error as string, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="m-0 mb-2 text-4xl font-semibold">{t("title")}</h1>
      <p className="m-0 mb-7 text-sm text-dim">
        {t("alreadyMember")}{" "}
        <Link
          href={`/login${redirect ? `?redirect=${redirect}` : ""}`}
          className="text-accent-tint transition-colors hover:text-accent-bright"
        >
          {t("signIn")}
        </Link>
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleRegister}>
        <Field label={t("fullName")} error={errors.fullName ?? undefined}>
          <Input
            name="fullName"
            type="text"
            placeholder={t("fullNamePlaceholder")}
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </Field>

        <Field label={t("email")} error={errors.email ?? undefined}>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Field>

        <Field label={t("password")} error={errors.password ?? undefined}>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
              value={formData.password}
              onChange={handleChange}
              className="pe-11"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 end-3.5 flex cursor-pointer items-center text-dim transition-colors hover:text-fg"
            >
              {showPassword ? <FiEye /> : <FiEyeOff />}
            </span>
          </div>
        </Field>

        <Field
          label={t("confirmPassword")}
          error={errors.confirmPassword ?? undefined}
        >
          <div className="relative">
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t("confirmPasswordPlaceholder")}
              value={formData.confirmPassword}
              onChange={handleChange}
              className="pe-11"
              required
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 end-3.5 flex cursor-pointer items-center text-dim transition-colors hover:text-fg"
            >
              {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
            </span>
          </div>
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loading size="sm" color="border-white" />}
          {t("submit")}
        </Button>

        {errors.general && (
          <p className="text-center text-xs text-danger">{errors.general}</p>
        )}
      </form>
    </>
  );
}

export default function SignUp() {
  return (
    <AuthShell>
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <Loading />
          </div>
        }
      >
        <SignUpForm />
      </Suspense>
    </AuthShell>
  );
}
