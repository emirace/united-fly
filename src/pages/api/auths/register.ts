import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import dbConnect from "@/utils/dbConnect";
import User from "@/model/user";
import corsMiddleware from "@/utils/middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();

  try {
    const { fullName, email, password } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
