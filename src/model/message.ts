import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Schema.Types.ObjectId;
  sender: mongoose.Schema.Types.ObjectId;
  receiver?: mongoose.Schema.Types.ObjectId;
  content: string;
  image?: string;
  forwardedFrom?: mongoose.Schema.Types.ObjectId;
  replyTo?: mongoose.Schema.Types.ObjectId;
  referencedUser?: mongoose.Schema.Types.ObjectId;
  referencedProduct?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: { type: Schema.Types.ObjectId, required: true },
    receiver: { type: Schema.Types.ObjectId },
    content: { type: String, default: "" },
    image: { type: String },
    forwardedFrom: { type: Schema.Types.ObjectId, ref: "Message" },
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
    referencedUser: { type: Schema.Types.ObjectId },
    referencedProduct: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
