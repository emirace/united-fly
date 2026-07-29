import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Booking from "@/model/booking";
import corsMiddleware from "@/utils/middleware";

/**
 * Public booking lookup. Deliberately unauthenticated — the tracking page is
 * offered to travellers who booked without an account, and a booking reference
 * is the credential. (This route was previously behind `authenticateUser`,
 * which made the tracking page unusable for exactly the visitors it targets.)
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res);

  await dbConnect();

  switch (req.method) {
    case "POST":
      return getTrackBooking(req, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

// GET /api/bookings/user/:userId → Get all bookings of a user
const getTrackBooking = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findOne({ bookingId })
      .populate({
        path: "flightId",
        populate: [{ path: "destination" }, { path: "origin" }],
      })
      .populate("seatId");

    if (!booking) {
      res.status(404).json("Booking not found");
      return;
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user bookings", error });
    console.log(error);
  }
};

export default handler;
