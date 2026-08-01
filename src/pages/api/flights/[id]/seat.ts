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
    // Released seats are back on sale, so they must not come back as taken.
    // `$ne: false` also matches rows written before the field existed.
    const seats = await Seat.find({
      flightId: id,
      isBooked: { $ne: false },
    }).sort({
      seatNumber: 1,
    });

    // An empty cabin is a valid answer — 404 here made the seat picker treat
    // "nothing sold yet" as a failed request.
    res.status(200).json(seats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching seats", error });
  }
};
