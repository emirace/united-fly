import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import { v4 as uuidv4 } from "uuid";
import Booking from "@/model/booking";
import Payment from "@/model/payment";
import corsMiddleware, {
  AuthenticatedRequest,
  authenticateUser,
  isAdmin,
} from "@/utils/middleware";
import Seat from "@/model/seat";
import mongoose from "mongoose";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await corsMiddleware(req, res);
  await dbConnect();

  switch (req.method) {
    case "GET":
      return getPayments(req, res);
    case "POST":
      return processPayment(req, res);
    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
}

// POST /api/payments → Process a payment
const processPayment = async (
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
      const payment = await Payment.create(
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

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({ booking: booking[0], payment: payment[0] });
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

const getPayments = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!(await isAdmin(req))) {
      return res.status(403).json({ message: "Forbidden" });
    }
    // The airports and seats are populated one level deeper than they look:
    // without them the admin booking modal renders "undefined (undefined)" for
    // the route, and a ticket downloaded from there has no origin or seats.
    const payments = await Payment.find()
      .populate("userId", "-password")
      .populate({
        path: "bookingId",
        populate: [
          {
            path: "flightId",
            populate: [{ path: "destination" }, { path: "origin" }],
          },
          { path: "seatId" },
        ],
      });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching  payments", error });
  }
};

export default authenticateUser(handler);
