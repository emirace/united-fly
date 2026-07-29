import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Conversation from "@/model/conversation";
import Message from "@/model/message";
import { ChatRequest, authenticateChat } from "@/utils/chatServer";

/**
 * POST /api/messages/read → mark the other party's messages as read.
 *
 * Replaces the `markAsRead` socket event from the old realtime chat service.
 */
const handler = async (req: ChatRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const viewer = req.chat!;

  try {
    const { conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({ message: "conversationId is required" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!viewer.isAdmin && String(conversation.customer) !== viewer.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { modifiedCount } = await Message.updateMany(
      {
        conversationId: conversation._id,
        sender: { $ne: new mongoose.Types.ObjectId(viewer.id) },
        read: false,
      },
      { $set: { read: true } }
    );

    return res.status(200).json({ status: true, updated: modifiedCount });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return res.status(500).json({ message: "Error marking messages as read" });
  }
};

export default authenticateChat(handler);
