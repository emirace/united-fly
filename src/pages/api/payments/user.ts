import type { NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import corsMiddleware, {
  AuthenticatedRequest,
  authenticateUser,
} from "@/utils/middleware";
import Payment from "@/model/payment";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await corsMiddleware(req, res);

  await dbConnect();

  switch (req.method) {
    case "GET":
      return getUserPayments(req, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

// GET /api/payments/user/:userId → Get all payments of a user
const getUserPayments = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  try {
    const userId = req.user!.id;
    const payments = await Payment.find({ userId }).populate("bookingId");

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user payments", error });
  }
};

export default authenticateUser(handler);
