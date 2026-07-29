"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { registerUser } from "@/services/auth";
import { useToastNotification } from "@/context/toastNotification";
import AuthShell from "@/components/auth/authShell";
import Loading from "@/components/common/loading";
import { Button, Field, Input } from "@/components/ui";

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function SignUpForm() {
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
      newErrors.email = "A valid email is required";
    }
    if (!formData.password.trim() || formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      <h1 className="m-0 mb-2 text-4xl font-semibold">Join MileClub</h1>
      <p className="m-0 mb-7 text-sm text-dim">
        Already a member?{" "}
        <Link
          href={`/login${redirect ? `?redirect=${redirect}` : ""}`}
          className="text-accent-tint transition-colors hover:text-accent-bright"
        >
          Sign in
        </Link>
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleRegister}>
        <Field label="Full name" error={errors.fullName ?? undefined}>
          <Input
            name="fullName"
            type="text"
            placeholder="Ada Okonkwo"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </Field>

        <Field label="Email address" error={errors.email ?? undefined}>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Field>

        <Field label="Password" error={errors.password ?? undefined}>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              className="pr-11"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3.5 flex cursor-pointer items-center text-dim transition-colors hover:text-fg"
            >
              {showPassword ? <FiEye /> : <FiEyeOff />}
            </span>
          </div>
        </Field>

        <Field
          label="Confirm password"
          error={errors.confirmPassword ?? undefined}
        >
          <div className="relative">
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="pr-11"
              required
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3.5 flex cursor-pointer items-center text-dim transition-colors hover:text-fg"
            >
              {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
            </span>
          </div>
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loading size="sm" color="border-white" />}
          Create account
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
