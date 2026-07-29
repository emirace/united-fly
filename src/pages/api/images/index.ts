import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import formidable from "formidable";
import dbConnect from "@/utils/dbConnect";
import Image from "@/model/image";
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

// POST /api/images → store a chat attachment, returning the path it serves from
const uploadHandler = async (req: ChatRequest, res: NextApiResponse) => {
  await dbConnect();

  try {
    const form = formidable({
      maxFileSize: MAX_UPLOAD_BYTES,
      maxFiles: 1,
      keepExtensions: true,
    });
    const [, files] = await form.parse(req);

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

    const image = await Image.create({ data, contentType });

    return res.status(201).json({ imageUrl: `/api/images/${image._id}` });
  } catch (error) {
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
