/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Flight from "@/model/flight";
import corsMiddleware, { isAdmin } from "@/utils/middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res);
  await dbConnect();

  switch (req.method) {
    case "GET":
      return getFlights(req, res);
    case "POST":
      return addFlight(req, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

// GET /flights → Search flights with filters
const getFlights = async (req: NextApiRequest, res: NextApiResponse) => {
  const { date, origin, destination } = req.query;
  const query: any = {};

  if (date) query.departureTime = { $gte: new Date(date as string) };
  if (origin) query.origin = origin;
  if (destination) query.destination = destination;

  const flights = await Flight.find(query).populate("origin destination");
  res.status(200).json(flights);
};

// Generate a random flight number (Example: FL1234)
const generateFlightNumber = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `FL${randomNum}`;
};

// Calculate flight duration (in minutes)
const calculateDuration = (departureTime: Date, arrivalTime: Date) => {
  return Math.round(
    (new Date(arrivalTime).getTime() - new Date(departureTime).getTime()) /
      60000
  );
};

// POST /flights → Add a new flight (Admin only)
const addFlight = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!(await isAdmin(req))) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { departureTime, arrivalTime, ...rest } = req.body;

  const flightData = {
    ...rest,
    flightNumber: generateFlightNumber(),
    duration: calculateDuration(departureTime, arrivalTime),
    departureTime: new Date(departureTime),
    arrivalTime: new Date(arrivalTime),
    availableSeats: Math.floor(100 + Math.random() * 90),
  };

  const flight = new Flight(flightData);
  await flight.save();
  res.status(201).json(flight);
};
