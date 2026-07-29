import type { NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Conversation from "@/model/conversation";
import Message from "@/model/message";
import {
  ChatRequest,
  authenticateChat,
  serializeMessage,
} from "@/utils/chatServer";

// POST /api/messages/forward → forward an existing message to another thread
const handler = async (req: ChatRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const viewer = req.chat!;

  try {
    const { receiver, messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ message: "messageId is required" });
    }

    const original = await Message.findById(messageId);
    if (!original) {
      return res.status(404).json({ message: "Message not found" });
    }

    // `receiver` carries the target conversation for a forward; without one the
    // message is re-sent into the thread it came from.
    const targetId = receiver || original.conversationId;
    const conversation = await Conversation.findById(targetId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (!viewer.isAdmin && String(conversation.customer) !== viewer.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      sender: viewer.id,
      receiver: viewer.isAdmin ? conversation.customer : conversation.agent,
      content: original.content,
      image: original.image,
      forwardedFrom: original._id,
      read: false,
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return res.status(201).json({ message: serializeMessage(message) });
  } catch (error) {
    console.error("Error forwarding message:", error);
    return res.status(500).json({ message: "Error forwarding message" });
  }
};

export default authenticateChat(handler);
