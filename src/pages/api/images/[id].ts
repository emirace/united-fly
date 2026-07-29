import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Image from "@/model/image";

// GET /api/images/:id → serve a stored chat attachment
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id } = req.query;
  if (!mongoose.Types.ObjectId.isValid(String(id))) {
    return res.status(400).json({ message: "Invalid image id" });
  }

  await dbConnect();

  try {
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Attachment bytes never change once written.
    res.setHeader("Content-Type", image.contentType);
    res.setHeader("Cache-Control", "private, max-age=31536000, immutable");
    return res.status(200).send(image.data);
  } catch (error) {
    console.error("Error fetching image:", error);
    return res.status(500).json({ message: "Error fetching image" });
  }
}
