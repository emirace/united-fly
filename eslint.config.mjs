import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      /**
       * Flags the "load on mount" and "sync prop into state" effects that the
       * contexts, dashboard pages and payment forms carried over from the Vite
       * app. The pattern is deliberate there — data is fetched client-side from
       * /api on mount — so this stays visible as a warning rather than blocking
       * lint. Worth revisiting per-screen if these move to server components.
       */
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
