import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Booking from "@/model/booking";
import corsMiddleware from "@/utils/middleware";

// PUT /api/bookings/:id/check-in → Check in for a flight
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
    const { id } = req.query;
    if (!mongoose.Types.ObjectId.isValid(String(id))) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "checked-in" },
      { new: true }
    ).populate("flightId userId seatId");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error checking in:", error);
    res.status(500).json({ message: "Error checking in" });
  }
}
