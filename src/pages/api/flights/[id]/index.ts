import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Flight from "@/model/flight";
import corsMiddleware, { isAdmin } from "@/utils/middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  await corsMiddleware(req, res);

  switch (req.method) {
    case "GET":
      return getFlightById(req, res);
    case "PUT":
      return updateFlight(req, res);
    case "DELETE":
      return deleteFlight(req, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

// GET /flights/:id → Get flight details
const getFlightById = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const flight = await Flight.findById(req.query.id)
      .populate("origin")
      .populate("destination");
    if (!flight) return res.status(404).json({ message: "Flight not found" });
    res.status(200).json(flight);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching flight details", error });
  }
};

// PUT /flights/:id → Update flight details (Admin only)
const updateFlight = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!(await isAdmin(req))) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const flight = await Flight.findByIdAndUpdate(req.query.id, req.body, {
      new: true,
    });
    if (!flight) return res.status(404).json({ message: "Flight not found" });
    res.status(200).json(flight);
  } catch (error) {
    res.status(500).json({ message: "Error updating flight", error });
  }
};

// DELETE /flights/:id → Delete a flight (Admin only)
const deleteFlight = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!(await isAdmin(req))) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const flight = await Flight.findByIdAndDelete(req.query.id);
    if (!flight) return res.status(404).json({ message: "Flight not found" });
    res.status(200).json({ message: "Flight deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting flight", error });
  }
};
