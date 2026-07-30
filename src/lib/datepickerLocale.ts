"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { registerLocale } from "react-datepicker";
import type { Locale as DateFnsLocale } from "date-fns";

/**
 * `react-datepicker` formats through date-fns, not moment — so setting moment's
 * locale (components/common/momentLocale.tsx) does nothing for the calendar or
 * the formatted value in the input. This registers the matching date-fns locale.
 *
 * The imports are written out one per locale rather than built from a template
 * literal: a bundler can only code-split an import it can resolve statically,
 * and `import(`date-fns/locale/${locale}`)` silently resolves to nothing. The
 * upside is that only the locales listed here ship.
 *
 * Adding a language means adding a line here as well as in i18n/config.ts. A
 * missing entry is not fatal — the calendar just stays English.
 */
const loaders: Record<string, () => Promise<{ default: DateFnsLocale }>> = {
  fr: () => import("date-fns/locale/fr").then((m) => ({ default: m.fr })),
  ar: () => import("date-fns/locale/ar").then((m) => ({ default: m.ar })),
};

/**
 * Returns the locale code to pass to `<DatePicker locale={…} />`, or undefined
 * for English (date-fns' built-in default) and while the bundle is loading.
 */
export function useDatePickerLocale(): string | undefined {
  const locale = useLocale();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const load = loaders[locale];
    if (!load) return;

    let cancelled = false;
    load()
      .then(({ default: dateFnsLocale }) => {
        if (cancelled) return;
        registerLocale(locale, dateFnsLocale);
        setReady(true);
      })
      .catch(() => {
        // Leave the calendar in English rather than break the page.
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  return ready ? locale : undefined;
}
