import mongoose, { Schema, Document } from "mongoose";

export interface IAirport extends Document {
  name: string;
  code: string;
  city: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

const AirportSchema = new Schema<IAirport>(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Airport =
  mongoose.models.Airport || mongoose.model<IAirport>("Airport", AirportSchema);
export default Airport;
