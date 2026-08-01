import { v2 as cloudinary } from "cloudinary";

/**
 * Attachments live in Cloudinary rather than on disk or in Mongo: the app runs
 * on serverless hosts where the filesystem is ephemeral, and storing image bytes
 * as Mongo documents cost a DB round-trip and our own bandwidth on every read.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** Folder every upload lands in, so the account stays tidy across environments. */
export const UPLOAD_FOLDER = "united-fly";

/**
 * Throws if the credentials are missing. The SDK itself fails with an opaque
 * "Must supply api_key" only once a request is in flight, so routes call this
 * up front to fail with something a deployer can act on.
 */
export function assertCloudinaryConfigured() {
  const missing = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ].filter((name) => !process.env[name]);

  if (missing.length) {
    throw new Error(
      `Missing Cloudinary configuration: ${missing.join(
        ", "
      )}. Define these inside .env.local`
    );
  }
}

/**
 * Recovers the `public_id` needed to delete an asset from the URL we persisted.
 *
 * A secure_url looks like
 * `https://res.cloudinary.com/<cloud>/image/upload/v1730000000/united-fly/abc123.png`
 * — everything after the version segment, minus the extension, is the id.
 *
 * Returns null for anything that isn't a Cloudinary delivery URL, which is what
 * keeps callers from acting on the legacy `/api/images/<objectId>` strings still
 * held by older messages and payments.
 */
export function publicIdFromUrl(url: string): string | null {
  const match = /\/image\/upload\/(.+)$/.exec(url);
  if (!url.includes("res.cloudinary.com") || !match) {
    return null;
  }

  const segments = match[1].split("/");

  // Drop transformation segments and the `v<digits>` version, keeping the
  // folder path that follows them.
  const versionAt = segments.findIndex((segment) => /^v\d+$/.test(segment));
  const path = (versionAt === -1 ? segments : segments.slice(versionAt + 1)).join(
    "/"
  );

  const publicId = path.replace(/\.[^./]+$/, "");
  return publicId || null;
}

export default cloudinary;
