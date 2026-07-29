import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import GuestUser from "@/model/guestUser";
import corsMiddleware from "@/utils/middleware";
import { signGuestToken } from "@/utils/chatServer";

/**
 * POST /api/users/login-guest → identify an anonymous visitor for the support
 * widget.
 *
 * The returned token is a *guest* token and is stored client-side under
 * `chatToken`, never `authToken`: guests live in their own collection and can
 * never resolve to a real account, so supplying a customer's email here grants
 * nothing beyond a support thread of one's own.
 */
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
    const { email, fullName } = req.body;

    if (!email || !fullName) {
      return res
        .status(400)
        .json({ status: false, message: "email and fullName are required" });
    }

    const normalized = String(email).toLowerCase().trim();

    let guest = await GuestUser.findOne({ email: normalized });
    if (!guest) {
      guest = await GuestUser.create({ email: normalized, fullName });
    } else if (guest.fullName !== fullName) {
      guest.fullName = fullName;
      await guest.save();
    }

    return res.status(200).json({
      status: true,
      guestUser: {
        _id: String(guest._id),
        fullName: guest.fullName,
        email: guest.email,
        role: "Guest",
        createdAt: guest.createdAt,
        token: signGuestToken(String(guest._id)),
      },
    });
  } catch (error) {
    console.error("Guest login error:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
}
