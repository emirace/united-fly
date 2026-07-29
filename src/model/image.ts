import mongoose, { Schema, Document } from "mongoose";

/**
 * Chat attachments are stored in Mongo rather than on disk: the app runs on
 * serverless hosts where the filesystem is ephemeral, so an uploaded file
 * would vanish between requests.
 */
export interface IImage extends Document {
  data: Buffer;
  contentType: string;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
  },
  { timestamps: true }
);

const Image =
  mongoose.models.Image || mongoose.model<IImage>("Image", ImageSchema);

export default Image;
