import type { NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Conversation from "@/model/conversation";
import Message from "@/model/message";
import {
  ChatRequest,
  authenticateChat,
  serializeMessage,
} from "@/utils/chatServer";

// POST /api/messages/reply → reply to a specific message
const handler = async (req: ChatRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const viewer = req.chat!;

  try {
    const { receiver, content, replyTo } = req.body;

    if (!content || !replyTo) {
      return res
        .status(400)
        .json({ message: "content and replyTo are required" });
    }

    const original = await Message.findById(replyTo);
    if (!original) {
      return res.status(404).json({ message: "Message not found" });
    }

    const conversation = await Conversation.findById(original.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!viewer.isAdmin && String(conversation.customer) !== viewer.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      sender: viewer.id,
      receiver: receiver || original.sender,
      content,
      replyTo,
      read: false,
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return res.status(201).json({ message: serializeMessage(message) });
  } catch (error) {
    console.error("Error replying to message:", error);
    return res.status(500).json({ message: "Error replying to message" });
  }
};

export default authenticateChat(handler);
