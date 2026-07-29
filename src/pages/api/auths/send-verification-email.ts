import type { NextApiResponse } from "next";
import crypto from "crypto";
import dbConnect from "@/utils/dbConnect";
import User from "@/model/user";
import sendEmail from "@/utils/email";
import Token from "@/model/token";
import corsMiddleware, {
  AuthenticatedRequest,
  authenticateUser,
} from "@/utils/middleware";

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  await corsMiddleware(req, res);

  await dbConnect();

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const verificationToken = crypto.randomBytes(20).toString("hex");
  const verificationTokenHash = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  await Token.create({
    userId: user._id,
    token: verificationTokenHash,
    type: "verifyEmail",
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  await sendEmail({
    to: user.email,
    subject: "Email Verification",
    text: `Click the link to verify your email: ${verificationUrl}`,
  });

  return res.status(200).json({ message: "Verification email sent" });
};

export default authenticateUser(handler);
