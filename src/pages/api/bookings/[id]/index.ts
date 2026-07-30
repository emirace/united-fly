import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Booking from "@/model/booking";
import Seat from "@/model/seat";
import corsMiddleware, { isAdmin } from "@/utils/middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res);
  await dbConnect();

  switch (req.method) {
    case "GET":
      return getBookingById(req, res);
    case "PUT":
      if (req.url?.endsWith("/cancel")) return cancelBooking(req, res);
      if (req.url?.endsWith("/check-in")) return checkInBooking(req, res);
      if (req.url?.endsWith("/confirm")) return confirmBooking(req, res);
      return res.status(405).json({ message: "Invalid operation" });
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

// GET /api/bookings/:id → Get booking details
const getBookingById = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    const booking = await Booking.findOne({ id })
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

// PUT /api/bookings/:id/cancel → Cancel a booking
const cancelBooking = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!(await isAdmin(req))) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req.query;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Release seat
    await Seat.findByIdAndUpdate(booking.seatId, { isBooked: false });

    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling booking", error });
  }
};

// PUT /api/bookings/:id/check-in → Check in for a flight
const checkInBooking = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "checked-in" },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "Checked in successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error checking in", error });
  }
};

const confirmBooking = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!(await isAdmin(req))) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req.query;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "confirmed" },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "Checked in successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error checking in", error });
  }
};
