"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from "@/i18n/config";

/**
 * Persists the visitor's language choice. The switcher calls this and then
 * `router.refresh()`, which re-renders the tree with the new locale resolved
 * server-side — no full page load, no flash of the previous language.
 */
export async function setLocale(value: string) {
  if (!isLocale(value)) return;

  (await cookies()).set(LOCALE_COOKIE, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
