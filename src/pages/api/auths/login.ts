import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
