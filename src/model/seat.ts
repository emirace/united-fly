import mongoose, { Schema, Document } from "mongoose";

export interface ISeat extends Document {
  flightId: mongoose.Schema.Types.ObjectId;
  seatNumber: string;
  class: string;
  createdAt: Date;
  updatedAt: Date;
}

const SeatSchema = new Schema<ISeat>(
  {
    flightId: { type: Schema.Types.ObjectId, ref: "Flight", required: true },
    seatNumber: { type: String, required: true },
    class: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Seat = mongoose.models.Seat || mongoose.model<ISeat>("Seat", SeatSchema);
export default Seat;
