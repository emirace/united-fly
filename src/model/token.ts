import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  token: { type: String, required: true },
  type: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const Token = mongoose.models.Token || mongoose.model("Token", TokenSchema);
export default Token;
