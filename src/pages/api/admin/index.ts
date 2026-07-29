import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Booking from "@/model/booking";
import Flight from "@/model/flight";
import Payment from "@/model/payment";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      return getAdminData(req, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

// GET /api/admin?type=bookings → Get all bookings
// GET /api/admin?type=payments → Get all payments
// GET /api/admin?type=flights → Get all flights
const getAdminData = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ message: "Missing query parameter: type" });
    }

    let data;
    switch (type) {
      case "bookings":
        data = await Booking.find().populate("userId flightId seatId");
        break;
      case "payments":
        data = await Payment.find().populate("userId bookingId");
        break;
      case "flights":
        data = await Flight.find().populate("origin destination");
        break;
      default:
        return res.status(400).json({
          message: "Invalid type. Use bookings, payments, or flights.",
        });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error });
  }
};
