import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  flightId: mongoose.Schema.Types.ObjectId;
  seatId: mongoose.Schema.Types.ObjectId[];
  bookingId: string;
  class: string;
  status: "pending" | "confirmed" | "cancelled" | "checked-in" | "completed";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  travellers: object[];
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    flightId: { type: Schema.Types.ObjectId, ref: "Flight", required: true },
    seatId: [{ type: Schema.Types.ObjectId, ref: "Seat", required: true }],
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "checked-in", "completed"],
      default: "pending",
    },
    travellers: [{ type: Object }],
    bookingId: { type: String, required: true },
    class: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
export default Booking;
