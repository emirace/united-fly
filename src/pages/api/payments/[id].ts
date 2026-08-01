import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Payment from "@/model/payment";
import corsMiddleware from "@/utils/middleware";
import Booking from "@/model/booking";
import sendEmail from "@/utils/email";
import siteOrigin from "@/utils/siteOrigin";
import {
  paymentConfirmedEmail,
  paymentFailedEmail,
  type PaymentEmailInput,
} from "@/utils/emailTemplates";

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
    const { id } = req.query;
    // Anything that isn't an ObjectId would otherwise reach Mongoose and come
    // back as a CastError 500 — a pay-by-link token pasted here, most often.
    if (!mongoose.Types.ObjectId.isValid(String(id))) {
      return res.status(400).json({ message: "Invalid payment id" });
    }

    // Seats come along because the confirmation screen offers a PDF ticket,
    // which has to list them.
    const payment = await Payment.findById(id)
      .populate({
        path: "bookingId",
        populate: [
          {
            path: "flightId",
            populate: [{ path: "destination" }, { path: "origin" }],
          },
          { path: "seatId" },
        ],
      })
      .populate("userId", "-password");

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.status(200).json(payment);
  } catch (error) {
    // The error object stays in the log — serialising it to the client leaked
    // schema paths and model names.
    console.error("Error fetching payment details:", error);
    res.status(500).json({ message: "Error fetching payment details" });
  }
};

// PUT /api/payments/:id → Update payment status
const updatePaymentStatus = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { id } = req.query;
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Payment status is required" });
    }

    // Update the payment status
    const payment = await Payment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("userId", "-password");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Get the booking ID from the payment record
    const bookingId = payment.bookingId;

    if (!bookingId) {
      return res
        .status(400)
        .json({ message: "Booking ID not found in payment" });
    }

    // Update the corresponding booking status. The flight, its airports and the
    // seats are populated because the confirmation email lists all of them.
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      status === "successful"
        ? { status: "confirmed", paymentStatus: "paid" }
        : { status: "cancelled", paymentStatus: "failed" },
      { new: true }
    )
      .populate({
        path: "flightId",
        populate: [{ path: "destination" }, { path: "origin" }],
      })
      .populate("seatId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // `flightId` is null when the flight has since been deleted, so every field
    // below is read defensively — the email is worth sending without a route.
    const flight = booking.flightId;
    const details: PaymentEmailInput = {
      recipientName: payment.userId?.fullName || payment.userId?.email || "there",
      bookingRef: booking.bookingId,
      origin: flight?.origin,
      destination: flight?.destination,
      flightNumber: flight?.flightNumber,
      departureTime: flight?.departureTime,
      arrivalTime: flight?.arrivalTime,
      cabin: booking.class,
      seats: (booking.seatId ?? [])
        .map((seat: { seatNumber?: string }) => seat?.seatNumber)
        .filter(Boolean),
      travellerCount: booking.travellers?.length ?? 0,
      amount: payment.amount,
      currency: payment.currency,
      bookingsUrl: `${siteOrigin(req)}/dashboard/bookings`,
      reason,
    };

    const message =
      status === "successful"
        ? paymentConfirmedEmail(details)
        : paymentFailedEmail(details);

    // The status change is already committed, so a mail failure (bad SMTP
    // credentials, provider outage) must not turn a successful approval into a
    // 500 for the admin. It is reported back in the response instead, so the
    // dashboard can say the email didn't go out rather than staying silent.
    let emailed = true;
    try {
      await sendEmail({
        to: payment.confirmEmail || payment.userId.email,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    } catch (mailError) {
      emailed = false;
      console.error("Payment status email failed to send:", mailError);
    }

    res
      .status(200)
      .json({ message: "Payment status updated", payment, booking, emailed });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Error updating payment status", error });
  }
};
