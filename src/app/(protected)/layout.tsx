"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/user";
import Loading from "@/components/common/loading";

/**
 * Auth gate for every route in this group — the App Router equivalent of the
 * old `<ProtectedRoute>` wrapper. Signed-out visitors bounce to /login and
 * come back here after signing in.
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  return user ? <>{children}</> : null;
}
