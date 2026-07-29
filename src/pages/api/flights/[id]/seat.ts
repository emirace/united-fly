import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Seat from "@/model/seat";
import corsMiddleware from "@/utils/middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res);

  await dbConnect();

  switch (req.method) {
    case "GET":
      return getAvailableSeats(req, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

// GET /flights/:flightId/seats → Get available seats for a flight
const getAvailableSeats = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    console.log(id);
    const seats = await Seat.find({ flightId: id }).sort({
      seatNumber: 1,
    });

    if (!seats.length) {
      return res.status(404).json({ message: "No available seats found" });
    }

    res.status(200).json(seats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching seats", error });
  }
};
