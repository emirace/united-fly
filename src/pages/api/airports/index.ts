import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Airport from "@/model/airport";
import corsMiddleware from "@/utils/middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res);
  await dbConnect();

  switch (req.method) {
    case "GET":
      if (req.query.id) {
        return getAirportById(req, res);
      }
      return getAllAirports(req, res);
    case "POST":
      return createAirport(req, res);
    case "PUT":
      return updateAirport(req, res);
    case "DELETE":
      return deleteAirport(req, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

const getAllAirports = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const airports = await Airport.find();
    res.status(200).json(airports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching airports", error });
  }
};

const getAirportById = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    const airport = await Airport.findById(id);
    if (!airport) {
      return res.status(404).json({ message: "Airport not found" });
    }
    res.status(200).json(airport);
  } catch (error) {
    res.status(500).json({ message: "Error fetching airport", error });
  }
};

const createAirport = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const newAirport = new Airport(req.body);
    await newAirport.save();
    res.status(201).json(newAirport);
  } catch (error) {
    res.status(500).json({ message: "Error creating airport", error });
  }
};

const updateAirport = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id, ...updateData } = req.body;
    const updatedAirport = await Airport.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedAirport) {
      return res.status(404).json({ message: "Airport not found" });
    }
    res.status(200).json(updatedAirport);
  } catch (error) {
    res.status(500).json({ message: "Error updating airport", error });
  }
};

const deleteAirport = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.body;
    const deletedAirport = await Airport.findByIdAndDelete(id);
    if (!deletedAirport) {
      return res.status(404).json({ message: "Airport not found" });
    }
    res.status(200).json({ message: "Airport deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting airport", error });
  }
};
