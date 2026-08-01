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
export const locales = ["en", "fr", "de", "ja", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Shown in the switcher, each in its own language. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ar: "العربية",
};

/** Short label for the compact navbar pill. */
export const localeShortNames: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  de: "DE",
  ja: "JA",
  ar: "AR",
};

export const rtlLocales: readonly Locale[] = ["ar"];

/**
 * Locales whose script does not take the design's small-label treatment —
 * mono, uppercase, and letter-spaced.
 *
 * All three parts of that are Latin typographic devices. Letter-spacing breaks
 * Arabic's contextual joining outright (the definite article loses its alef),
 * merely looks wrong spread across Japanese glyphs, and uppercasing means
 * nothing in either script. The mono face also carries no Arabic or CJK glyphs,
 * so those characters fall back to a different font mid-label.
 *
 * A new locale written in Latin script needs no entry here.
 */
export const nonLatinLocales: readonly Locale[] = ["ar", "ja"];

export const usesLatinEyebrow = (locale: Locale): boolean =>
  !nonLatinLocales.includes(locale);

export const LOCALE_COOKIE = "LOCALE";

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (locales as readonly string[]).includes(value);

export const dirFor = (locale: Locale): "ltr" | "rtl" =>
  rtlLocales.includes(locale) ? "rtl" : "ltr";
