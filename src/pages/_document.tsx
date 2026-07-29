import { Html, Head, Main, NextScript } from "next/document";

/**
 * The pages/ tree only serves API routes — no HTML pages are rendered from it.
 * This document exists so Next's dev server initialises the Pages Router route
 * manifest; without it, dynamic `pages/api/[param]` routes are shadowed by the
 * App Router's not-found handler in `next dev`.
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
