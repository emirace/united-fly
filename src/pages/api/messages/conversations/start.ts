import type { NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Conversation from "@/model/conversation";
import {
  ChatRequest,
  authenticateChat,
  findOrCreateConversation,
} from "@/utils/chatServer";

/**
 * POST /api/messages/conversations/start → open (or reuse) a thread.
 *
 * `participantId` is the counterpart an admin wants to reach; a customer always
 * lands on their own support thread regardless of what they pass.
 */
const handler = async (req: ChatRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const viewer = req.chat!;

  try {
    const { participantId, type = "Support" } = req.body;

    let conversation;
    if (viewer.isAdmin && participantId) {
      conversation = await Conversation.findOne({
        customer: participantId,
        type,
        closed: false,
      });
      if (!conversation) {
        conversation = await Conversation.create({
          customer: participantId,
          agent: viewer.id,
          participants: [participantId, viewer.id],
          type,
          lastMessageAt: new Date(),
        });
      }
    } else {
      conversation = await findOrCreateConversation(viewer, type);
    }

    return res.status(200).json({
      conversation: {
        _id: String(conversation._id),
        participants: (conversation.participants || []).map(String),
        type: conversation.type,
        closed: conversation.closed,
        isGuest: conversation.isGuest,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    return res.status(500).json({ message: "Error starting conversation" });
  }
};

export default authenticateChat(handler);
