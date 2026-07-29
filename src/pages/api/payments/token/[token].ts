import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Payment from "@/model/payment";
import corsMiddleware from "@/utils/middleware";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res);
  await dbConnect();

  switch (req.method) {
    case "GET":
      return getPaymentById(req, res);
    case "PUT":
      return updatePaymentStatus(req, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

// GET /api/payments/:id → Get payment details
const getPaymentById = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { token } = req.query;

    if (!token) {
      res.status(400).json("Token is required");
      return;
    }

    const decoded = jwt.verify(
      token as unknown as string,
      process.env.JWT_SECRET!
    ) as unknown as {
      id: string;
    };

    console.log(decoded);
    const payment = await Payment.findById(decoded.id)
      .populate({
        path: "bookingId",
        populate: {
          path: "flightId",
          populate: [{ path: "destination" }, { path: "origin" }],
        },
      })
      .populate("userId", "-password");

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment details", error });
    console.log(error);
  }
};

const updatePaymentStatus = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { token } = req.query;

    if (!token) {
      res.status(400).json("Token is required");
      return;
    }

    const { id } = jwt.verify(
      token as unknown as string,
      process.env.JWT_SECRET!
    ) as unknown as {
      id: string;
    };
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Update the payment status
    const payment = await Payment.findByIdAndUpdate(
      id,
      { image },
      { new: true }
    )
      .populate({
        path: "bookingId",
        populate: {
          path: "flightId",
          populate: [{ path: "destination" }, { path: "origin" }],
        },
      })
      .populate("userId", "-password");
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Error updating payment status", error });
  }
};
