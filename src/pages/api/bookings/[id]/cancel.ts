import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Booking from "@/model/booking";
import Seat from "@/model/seat";
import corsMiddleware, { isAdmin } from "@/utils/middleware";

// PUT /api/bookings/:id/cancel → Cancel a booking and release its seats
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res);

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();

  try {
    if (!(await isAdmin(req))) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.query;
    if (!mongoose.Types.ObjectId.isValid(String(id))) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    ).populate("flightId userId seatId");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // `seatId` is an array — the old code passed the whole array to
    // findByIdAndUpdate as a single id, so no seat was ever released.
    await Seat.updateMany(
      { _id: { $in: booking.seatId } },
      { isBooked: false }
    );

    // The dashboard swaps this straight into its table row, so it has to be
    // the booking itself, populated the way the list endpoint returns it.
    res.status(200).json(booking);
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Error cancelling booking" });
  }
}
