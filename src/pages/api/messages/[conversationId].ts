import type { NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Conversation from "@/model/conversation";
import Message from "@/model/message";
import {
  ChatRequest,
  authenticateChat,
  serializeMessage,
} from "@/utils/chatServer";

// GET /api/messages/:conversationId → the thread, oldest first
const handler = async (req: ChatRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const viewer = req.chat!;

  try {
    const { conversationId } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!viewer.isAdmin && String(conversation.customer) !== viewer.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    return res.status(200).json({ messages: messages.map(serializeMessage) });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Error fetching messages" });
  }
};

export default authenticateChat(handler);
