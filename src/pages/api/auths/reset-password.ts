import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import dbConnect from "@/utils/dbConnect";
import Token from "@/model/token";
import User from "@/model/user";
import corsMiddleware from "@/utils/middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  await corsMiddleware(req, res);

  await dbConnect();

  const { token } = req.query;
  const { password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and password are required" });
  }

  const resetTokenHash = crypto
    .createHash("sha256")
    .update(token as string)
    .digest("hex");

  try {
    const storedToken = await Token.findOne({
      token: resetTokenHash,
      type: "resetPassword",
      expiresAt: { $gt: Date.now() },
    });

    if (!storedToken) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(storedToken.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password; // Make sure password hashing is handled in the User model
    await user.save();
    await Token.deleteOne({ token: resetTokenHash });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}
