import type { NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Conversation from "@/model/conversation";
import Message from "@/model/message";
import {
  ChatRequest,
  authenticateChat,
  findOrCreateConversation,
  findSupportAgentId,
  serializeMessage,
} from "@/utils/chatServer";

// POST /api/messages/send → send a message, opening the thread if needed
const handler = async (req: ChatRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const viewer = req.chat!;

  try {
    const {
      content = "",
      image,
      type = "Support",
      conversationId,
      referencedUser,
      referencedProduct,
    } = req.body;

    if (!content && !image) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      if (!viewer.isAdmin && String(conversation.customer) !== viewer.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
    } else {
      // The support widget sends its first message with no conversation id.
      conversation = await findOrCreateConversation(viewer, type);
    }

    // Once an admin replies they own the thread, so the customer's widget can
    // show who they are talking to.
    if (viewer.isAdmin && String(conversation.agent || "") !== viewer.id) {
      conversation.agent = viewer.id;
      if (!conversation.participants.map(String).includes(viewer.id)) {
        conversation.participants.push(viewer.id);
      }
    }

    const receiver = viewer.isAdmin
      ? String(conversation.customer)
      : String(conversation.agent || (await findSupportAgentId()) || "") ||
        undefined;

    const message = await Message.create({
      conversationId: conversation._id,
      sender: viewer.id,
      receiver,
      content,
      image,
      referencedUser: referencedUser || undefined,
      referencedProduct: referencedProduct || undefined,
      read: false,
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return res.status(201).json({ message: serializeMessage(message) });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Error sending message" });
  }
};

export default authenticateChat(handler);
