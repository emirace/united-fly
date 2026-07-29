import mongoose, { Schema, Document } from "mongoose";

/**
 * Anonymous visitors who open the support widget without an account.
 *
 * They live in their own collection rather than in `User`: the chat used to be
 * a separate service with its own database, so a guest typing the email of a
 * real customer was never able to collide with — let alone impersonate — that
 * account. Keeping guests separate preserves that boundary now that both live
 * in one database.
 */
export interface IGuestUser extends Document {
  fullName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const GuestUserSchema = new Schema<IGuestUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
  },
  { timestamps: true }
);

const GuestUser =
  mongoose.models.GuestUser ||
  mongoose.model<IGuestUser>("GuestUser", GuestUserSchema);

export default GuestUser;
