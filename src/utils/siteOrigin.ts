import type { NextApiRequest } from "next";

/**
 * Origin to build outbound links from — payment links, and the buttons in
 * transactional email. The UI and the API are one deployment, so links are
 * same-origin: derived from the request unless a canonical public URL is
 * configured (useful behind a proxy or CDN).
 */
const siteOrigin = (req: NextApiRequest): string => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const forwardedHost = req.headers["x-forwarded-host"];
  const host =
    (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ||
    req.headers.host;

  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto =
    (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) ||
    (host?.startsWith("localhost") || host?.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${proto}://${host}`;
};

export default siteOrigin;
