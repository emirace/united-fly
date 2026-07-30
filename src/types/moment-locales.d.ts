/**
 * `moment/min/locales` is a side-effect-only bundle that registers every locale
 * on the shared moment instance. It ships no type declarations of its own, so
 * declare it here rather than reaching for `@ts-expect-error` at the call site
 * (see components/common/momentLocale.tsx).
 */
declare module "moment/min/locales" {
  const locales: unknown;
  export default locales;
}
