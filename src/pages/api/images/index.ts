import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import { Readable } from "stream";
import formidable, { errors as formidableErrors } from "formidable";
import type { UploadApiResponse } from "cloudinary";
import cloudinary, {
  UPLOAD_FOLDER,
  assertCloudinaryConfigured,
  publicIdFromUrl,
} from "@/utils/cloudinary";
import corsMiddleware from "@/utils/middleware";
import { ChatRequest, authenticateChat } from "@/utils/chatServer";

// formidable needs the raw stream, so Next must not parse the body first.
export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
];

const uploadToCloudinary = (data: Buffer) =>
  new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: UPLOAD_FOLDER, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error("Cloudinary returned no result"));
        }
        resolve(result);
      }
    );
    Readable.from(data).pipe(stream);
  });

// POST /api/images → store an attachment in Cloudinary, returning its CDN url
const uploadHandler = async (req: ChatRequest, res: NextApiResponse) => {
  try {
    const form = formidable({
      maxFileSize: MAX_UPLOAD_BYTES,
      maxFiles: 1,
      keepExtensions: true,
    });
    const [fields, files] = await form.parse(req);

    const uploaded = Array.isArray(files.image) ? files.image[0] : files.image;
    if (!uploaded) {
      return res.status(400).json({ message: "No image provided" });
    }

    const contentType = uploaded.mimetype || "application/octet-stream";
    if (!ALLOWED_TYPES.includes(contentType)) {
      return res.status(415).json({ message: "Unsupported image type" });
    }

    const data = await fs.readFile(uploaded.filepath);
    await fs.unlink(uploaded.filepath).catch(() => {});

    // Checked here rather than up front so a misconfigured deployment still
    // answers bad requests with 400/413/415 instead of masking them as 500s.
    assertCloudinaryConfigured();

    const result = await uploadToCloudinary(data);

    // Callers replacing an image (a profile photo, say) send the url they are
    // replacing. Cleanup is best-effort: an orphaned asset is not worth failing
    // an otherwise successful upload over.
    const replaced = Array.isArray(fields.deleteImage)
      ? fields.deleteImage[0]
      : fields.deleteImage;
    const replacedId = replaced ? publicIdFromUrl(replaced) : null;
    if (replacedId) {
      cloudinary.uploader
        .destroy(replacedId)
        .catch((error) =>
          console.error("Error deleting replaced image:", error)
        );
    }

    return res.status(201).json({ imageUrl: result.secure_url });
  } catch (error) {
    // formidable rejects oversized uploads mid-parse; that is the client's
    // fault, not ours.
    const code = (error as { code?: number }).code;
    if (
      code === formidableErrors.biggerThanMaxFileSize ||
      code === formidableErrors.biggerThanTotalMaxFileSize
    ) {
      return res.status(413).json({ message: "Image is too large" });
    }

    console.error("Error uploading image:", error);
    return res.status(500).json({ message: "Error uploading image" });
  }
};

const authenticatedUpload = authenticateChat(uploadHandler);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res);

  // The home page pings this on mount to warm the connection, before anyone
  // has signed in — so the ping stays public and only uploads require a token.
  if (req.method === "GET") {
    return res.status(200).json({ status: true });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  return authenticatedUpload(req, res);
}
