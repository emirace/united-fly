/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import { v4 as uuidv4 } from "uuid";
import Booking from "@/model/booking";
import Payment from "@/model/payment";
import corsMiddleware, {
  AuthenticatedRequest,
  authenticateUser,
} from "@/utils/middleware";
import Seat from "@/model/seat";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import siteOrigin from "@/utils/siteOrigin";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await corsMiddleware(req, res);
  await dbConnect();

  switch (req.method) {
    case "POST":
      return generatePaymentLink(req, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

// POST /api/payments → Process a payment
const generatePaymentLink = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  try {
    await dbConnect();

    const {
      seatNumber, // Now an array
      flightId,
      classType,
      amount,
      currency,
      confirmEmail,
      paymentMethod,
      travellers,
    } = req.body;

    if (
      !seatNumber?.length ||
      !amount ||
      !flightId ||
      !classType ||
      !currency ||
      !paymentMethod
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const userId = req.user!.id;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if any of the requested seats are already booked
      const existingSeats = await Seat.find({
        flightId,
        seatNumber: { $in: seatNumber },
      }).session(session);

      if (existingSeats.length > 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Seats ${existingSeats
            .map((s) => s.seatNumber)
            .join(", ")} are already booked`,
        });
      }

      // Create seat records for all selected seats
      const seats = await Seat.create(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        seatNumber.map((seat: any) => ({
          flightId,
          seatNumber: seat,
          class: classType,
        })),
        { session, ordered: true }
      );

      // Generate a unique booking ID
      const bookingId = `BOOK-${uuidv4().slice(0, 8)}`;

      // Create booking with all seat IDs
      const booking = await Booking.create(
        [
          {
            userId,
            bookingId,
            class: classType,
            flightId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            seatId: seats.map((s: { _id: any }) => s._id), // Store all seat IDs
            status: "pending",
            paymentStatus: "pending",
            travellers,
          },
        ],
        { session, ordered: true }
      );

      // Generate unique transaction ID
      const transactionId = uuidv4();

      // Create a single payment record for all seats booked
      const payment: any = await Payment.create(
        [
          {
            bookingId: booking[0]._id,
            userId,
            amount,
            currency,
            paymentMethod,
            transactionId,
            status: "pending",
            confirmEmail,
          },
        ],
        { session, ordered: true }
      );
      console.log(payment);
      const token = jwt.sign(
        { id: payment[0]._id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "7d",
        }
      );

      const link = `${siteOrigin(req)}/payment/${token}`;

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(201).json(link);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Transaction failed:", error);
      return res
        .status(500)
        .json({ message: "Error processing payment", error });
    }
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export default authenticateUser(handler);
