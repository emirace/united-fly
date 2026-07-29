import mongoose, { Schema, Document } from "mongoose";

export interface IFlight extends Document {
  flightNumber: string;
  origin: mongoose.Schema.Types.ObjectId;
  destination: mongoose.Schema.Types.ObjectId;
  departureTime: Date;
  arrivalTime: Date;
  duration: number;
  price: number;
  status: "scheduled" | "delayed" | "cancelled" | "departed" | "arrived";
  availableSeats: number;
  createdAt: Date;
  updatedAt: Date;
}

const FlightSchema = new Schema<IFlight>(
  {
    flightNumber: { type: String, required: true, unique: true, trim: true },
    origin: { type: Schema.Types.ObjectId, ref: "Airport", required: true },
    destination: {
      type: Schema.Types.ObjectId,
      ref: "Airport",
      required: true,
    },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["scheduled", "delayed", "cancelled", "departed", "arrived"],
      default: "scheduled",
    },
    availableSeats: { type: Number, required: true },
  },
  { timestamps: true }
);

const Flight =
  mongoose.models.Flight || mongoose.model<IFlight>("Flight", FlightSchema);
export default Flight;
