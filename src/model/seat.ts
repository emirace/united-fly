import mongoose, { Schema, Document } from "mongoose";

export interface ISeat extends Document {
  flightId: mongoose.Schema.Types.ObjectId;
  seatNumber: string;
  class: string;
  isBooked: boolean;
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
    // A seat document existing is what marks the number as sold, so cancelling
    // has to release it. It clears this flag rather than deleting the row, so a
    // cancelled booking still shows which seats it held. Documents written
    // before the field existed have no value, hence the `$ne: false` reads —
    // absent means still booked.
    isBooked: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Seat = mongoose.models.Seat || mongoose.model<ISeat>("Seat", SeatSchema);
export default Seat;
