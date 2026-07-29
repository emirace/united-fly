import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  /** The customer side of the thread — a `User` or, for guests, a `GuestUser`. */
  customer: mongoose.Schema.Types.ObjectId;
  /** The admin who last replied, if any. */
  agent?: mongoose.Schema.Types.ObjectId;
  participants: mongoose.Schema.Types.ObjectId[];
  type: string;
  closed: boolean;
  isGuest: boolean;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    customer: { type: Schema.Types.ObjectId, required: true, index: true },
    agent: { type: Schema.Types.ObjectId, ref: "User" },
    participants: [{ type: Schema.Types.ObjectId }],
    type: { type: String, default: "Support", index: true },
    closed: { type: Boolean, default: false },
    isGuest: { type: Boolean, default: false },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
