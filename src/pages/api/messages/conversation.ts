import type { NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import {
  ChatRequest,
  authenticateChat,
  buildConversationList,
  findOrCreateConversation,
} from "@/utils/chatServer";

/**
 * POST /api/messages/conversation → open a thread and return it in list shape
 * (with `lastMessage` / `unreadCount` / `otherUser`).
 */
const handler = async (req: ChatRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();
  const viewer = req.chat!;

  try {
    const { type = "Support" } = req.body;
    const created = await findOrCreateConversation(viewer, type);

    const list = await buildConversationList(viewer, type);
    const conversation =
      list.find((c) => c._id === String(created._id)) || list[0];

    return res.status(200).json({ conversation });
  } catch (error) {
    console.error("Error opening conversation:", error);
    return res.status(500).json({ message: "Error opening conversation" });
  }
};

export default authenticateChat(handler);
