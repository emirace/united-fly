import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Booking from "@/model/booking";
import corsMiddleware from "@/utils/middleware";

// The cancel/check-in/confirm actions used to be dispatched from here by
// sniffing `req.url`, but this file only ever matches `/api/bookings/:id` —
// the extra path segment meant Next never routed those requests here at all
// and answered 404. They live in sibling files now.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res);
  await dbConnect();

  switch (req.method) {
    case "GET":
      return getBookingById(req, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

// GET /api/bookings/:id → Get booking details
const getBookingById = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    if (!mongoose.Types.ObjectId.isValid(String(id))) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    // Was `findOne({ id })`, which filters on a path the schema doesn't have
    // and so never matched anything.
    const booking = await Booking.findById(id)
      .populate({
        path: "flightId",
        populate: [{ path: "destination" }, { path: "origin" }],
      })
      .populate("seatId")
      .populate("userId", "-password");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking", error });
    console.log(error);
  }
};
