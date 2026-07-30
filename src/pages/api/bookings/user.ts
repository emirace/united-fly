import type { NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Booking from "@/model/booking";
import corsMiddleware, {
  AuthenticatedRequest,
  authenticateUser,
} from "@/utils/middleware";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await corsMiddleware(req, res);

  await dbConnect();

  switch (req.method) {
    case "GET":
      return getUserBookings(req, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

// GET /api/bookings/user/:userId → Get all bookings of a user
const getUserBookings = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  try {
    const userId = req.user!.id;
    const bookings = await Booking.find({ userId })
      .populate({
        path: "flightId",
        populate: [{ path: "destination" }, { path: "origin" }],
      })
      .populate("seatId")
      .populate("userId", "-password");

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user bookings", error });
    console.log(error);
  }
};

export default authenticateUser(handler);
