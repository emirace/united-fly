import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import dbConnect from "@/utils/dbConnect";
import User from "@/model/user";
import Token from "@/model/token";
import sendEmail from "@/utils/email";
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

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await Token.create({
      userId: user._id,
      token: resetTokenHash,
      type: "resetPassword",
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiration
    });

    const resetUrl = `${process.env.FRONTEND_URL}/auth/resetpassword/${resetToken}`;
    const message = `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: message,
    });

    return res
      .status(200)
      .json({ message: "Email sent with reset instructions" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
