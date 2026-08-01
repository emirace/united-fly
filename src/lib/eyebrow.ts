"use client";

import { useLocale } from "next-intl";
import { defaultLocale, isLocale, usesLatinEyebrow } from "@/i18n/config";

/**
 * Whether the current language takes the design's mono/uppercase/letter-spaced
 * label treatment. See `nonLatinLocales` in i18n/config.ts for why some do not.
 *
 * Call sites keep their own tracking value — the design uses several — and use
 * this only to decide whether to apply it at all.
 */
export function useLatinEyebrow(): boolean {
  const locale = useLocale();
  return usesLatinEyebrow(isLocale(locale) ? locale : defaultLocale);
}
