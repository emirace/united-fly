import type { NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import {
  ChatRequest,
  authenticateChat,
  buildConversationList,
} from "@/utils/chatServer";

/**
 * GET /api/messages/conversations/:type
 *
 * Admins see every thread of that type (the support inbox); everyone else sees
 * only their own.
 */
const handler = async (req: ChatRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();

  try {
    const type = String(req.query.type || "Support");
    const conversations = await buildConversationList(req.chat!, type);
    return res.status(200).json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ message: "Error fetching conversations" });
  }
};

export default authenticateChat(handler);
