import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  bookingId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: "credit_card" | "crypto" | "bank_transfer" | "cashApp";
  transactionId: string;
  status: "pending" | "successful" | "failed" | "refunded";
  confirmEmail: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    confirmEmail: { type: String, required: true },
    image: { type: String },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "crypto", "bank_transfer", "cashApp"],
      required: true,
    },
    transactionId: { type: String, unique: true, required: true },
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Payment =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;
