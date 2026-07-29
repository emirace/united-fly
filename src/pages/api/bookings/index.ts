import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Booking from "@/model/booking";
import Seat from "@/model/seat";
import corsMiddleware, { isAdmin } from "@/utils/middleware";
import Flight from "@/model/flight";
import Airport from "@/model/airport";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res);
  await dbConnect();

  if (!(await isAdmin(req))) {
    return res.status(403).json({ message: "Forbidden" });
  }
  switch (req.method) {
    case "GET":
      return getBookings(req, res);
    case "POST":
      return createBooking(req, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

// POST /api/bookings → Create a booking
const createBooking = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId, flightId, seatId } = req.body;

    if (!userId || !flightId || !seatId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if the seat is available
    const seat = await Seat.findById(seatId);
    if (!seat || seat.isBooked) {
      return res
        .status(400)
        .json({ message: "Seat is already booked or does not exist" });
    }

    // Create booking
    const booking = await Booking.create({
      userId,
      flightId,
      seatId,
      status: "pending",
      paymentStatus: "pending",
    });

    // Mark seat as booked
    await Seat.findByIdAndUpdate(seatId, { isBooked: true });

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error });
  }
};

const getBookings = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await Flight.find();
    await Airport.find();
    const bookings = await Booking.find()
      .populate("flightId userId seatId")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};
