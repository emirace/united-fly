"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { loginUser } from "@/services/auth";
import { useToastNotification } from "@/context/toastNotification";
import { useUser } from "@/context/user";
import AuthShell from "@/components/auth/authShell";
import Loading from "@/components/common/loading";
import { Button, Field, Input } from "@/components/ui";

function LoginForm() {
  const t = useTranslations("auth.login");
  const { addNotification } = useToastNotification();
  const { getUser } = useUser();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string | null>>({
    email: null,
    password: null,
    general: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: null, password: null, general: null });

    const newErrors: Record<string, string | null> = {};
    if (!formData.email.trim()) newErrors.email = t("errors.email");
    if (!formData.password.trim()) newErrors.password = t("errors.password");

    if (Object.values(newErrors).some((error) => error)) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem("authToken", res.token);
      await getUser();
      setFormData({ email: "", password: "" });
      router.push(redirect || "/dashboard/profile");
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
        {t("newHere")}{" "}
        <Link
          href={`/signup${redirect ? `?redirect=${redirect}` : ""}`}
          className="text-accent-tint transition-colors hover:text-accent-bright"
        >
          {t("createAccount")}
        </Link>
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
              placeholder="••••••••"
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

        <div className="flex items-center justify-between text-[13px] text-dim">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4" />
            <span>{t("rememberMe")}</span>
          </label>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loading size="sm" color="border-white" />}
          {t("submit")}
        </Button>

        {errors.general && (
          <p className="text-center text-xs text-danger">{errors.general}</p>
        )}

        <div className="my-1 flex items-center gap-3.5 text-xs text-faint">
          <span className="h-px flex-1 bg-white/9" />
          {t("or")}
          <span className="h-px flex-1 bg-white/9" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => router.push("/tracking")}
        >
          {t("trackWithoutSignIn")}
        </Button>
      </form>
    </>
  );
}

export default function Login() {
  return (
    <AuthShell>
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <Loading />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
