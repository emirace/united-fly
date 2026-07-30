/**
 * The one place to edit when adding a language.
 *
 * Adding a locale is three steps:
 *   1. add its code here (and a display name below),
 *   2. run `npm run i18n:translate -- <code>`,
 *   3. commit the generated `messages/<code>.json`.
 *
 * If the language should also localise the date picker, add a matching entry to
 * `loaders` in lib/datepickerLocale.ts — those imports have to be written out
 * statically for the bundler to resolve them.
 *
 * A locale listed here without a message file will fail the build, which is
 * deliberate — a half-added language should not ship silently falling back to
 * English.
 */
export const locales = ["en", "fr", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Shown in the switcher, each in its own language. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

/** Short label for the compact navbar pill. */
export const localeShortNames: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  ar: "AR",
};

export const rtlLocales: readonly Locale[] = ["ar"];

export const LOCALE_COOKIE = "LOCALE";

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (locales as readonly string[]).includes(value);

export const dirFor = (locale: Locale): "ltr" | "rtl" =>
  rtlLocales.includes(locale) ? "rtl" : "ltr";
