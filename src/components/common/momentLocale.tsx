"use client";

import { useEffect } from "react";
import moment from "moment";

/**
 * Applies the app locale to `moment`, which formats every date in the booking
 * and dashboard screens.
 *
 * The locale bundles are imported dynamically and only for non-English
 * locales, so the English bundle stays exactly as small as it was before
 * translations existed — `moment/min/locales` is ~180KB and there is no reason
 * to ship it to a visitor reading the site in English.
 */
export default function MomentLocale({ locale }: { locale: string }) {
  useEffect(() => {
    if (locale === "en") {
      moment.locale("en");
      return;
    }

    let cancelled = false;
    import("moment/min/locales")
      .then(() => {
        if (!cancelled) moment.locale(locale);
      })
      .catch(() => {
        // A missing bundle is not worth breaking the page over — dates simply
        // stay in English.
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  return null;
}
