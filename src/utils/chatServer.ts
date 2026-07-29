import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "@/model/user";
import GuestUser from "@/model/guestUser";
import Conversation from "@/model/conversation";
import Message from "@/model/message";
import corsMiddleware from "@/utils/middleware";

export interface ChatIdentity {
  id: string;
  isGuest: boolean;
  isAdmin: boolean;
  fullName: string;
}

export interface ChatRequest extends NextApiRequest {
  chat?: ChatIdentity;
}

const GUEST_TOKEN_CLAIM = "guest";

export const signGuestToken = (id: string) =>
  jwt.sign({ id, [GUEST_TOKEN_CLAIM]: true }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });

/**
 * Resolves the caller of a chat endpoint. Unlike `authenticateUser`, this
 * accepts guest tokens as well as account tokens, because the support widget
 * is available to anonymous visitors.
 */
export const authenticateChat = (
  handler: (req: ChatRequest, res: NextApiResponse) => Promise<void | unknown>
) => {
  return async (req: ChatRequest, res: NextApiResponse) => {
    await corsMiddleware(req, res);

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      const decoded = jwt.verify(
        authHeader.split(" ")[1],
        process.env.JWT_SECRET as string
      ) as { id: string; guest?: boolean };

      if (decoded.guest) {
        const guest = await GuestUser.findById(decoded.id);
        if (!guest) {
          return res.status(401).json({ message: "Unauthorized: Unknown guest" });
        }
        req.chat = {
          id: String(guest._id),
          isGuest: true,
          isAdmin: false,
          fullName: guest.fullName,
        };
      } else {
        const user = await User.findById(decoded.id);
        if (!user) {
          return res.status(401).json({ message: "Unauthorized: Unknown user" });
        }
        req.chat = {
          id: String(user._id),
          isGuest: false,
          isAdmin: user.role === "Admin",
          fullName: user.fullName,
        };
      }

      return handler(req, res);
    } catch (error) {
      console.log(error);
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  };
};

/** The admin who fields support threads when no agent has replied yet. */
export const findSupportAgentId = async (): Promise<string | null> => {
  const admin = await User.findOne({ role: "Admin" }).select("_id");
  return admin ? String(admin._id) : null;
};

type Party = { _id: string; fullName: string; image?: string };

/**
 * Looks display names up across both identity collections in one pass, so the
 * conversation list can label a thread whether the customer has an account or
 * came in as a guest.
 */
export const resolveParties = async (
  ids: string[]
): Promise<Map<string, Party>> => {
  const unique = [...new Set(ids.filter(Boolean))].filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );
  const map = new Map<string, Party>();
  if (!unique.length) return map;

  const [users, guests] = await Promise.all([
    User.find({ _id: { $in: unique } }).select("fullName image"),
    GuestUser.find({ _id: { $in: unique } }).select("fullName"),
  ]);

  for (const u of users) {
    map.set(String(u._id), {
      _id: String(u._id),
      fullName: u.fullName || u.email || "Customer",
      image: u.image,
    });
  }
  for (const g of guests) {
    map.set(String(g._id), {
      _id: String(g._id),
      fullName: g.fullName || g.email || "Guest",
    });
  }
  return map;
};

/**
 * Builds the conversation list shape the client expects: `lastMessage`,
 * `unreadCount` from the viewer's perspective, and `otherUser` for the header.
 */
export const buildConversationList = async (
  viewer: ChatIdentity,
  type: string
) => {
  const filter: Record<string, unknown> = { type };
  if (!viewer.isAdmin) {
    filter.customer = new mongoose.Types.ObjectId(viewer.id);
  }

  const conversations = await Conversation.find(filter)
    .sort({ lastMessageAt: -1 })
    .lean();

  if (!conversations.length) return [];

  const ids = conversations.map((c) => c._id);

  const [lastMessages, unreadCounts] = await Promise.all([
    Message.aggregate([
      { $match: { conversationId: { $in: ids } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$conversationId", doc: { $first: "$$ROOT" } } },
    ]),
    Message.aggregate([
      {
        $match: {
          conversationId: { $in: ids },
          read: false,
          sender: { $ne: new mongoose.Types.ObjectId(viewer.id) },
        },
      },
      { $group: { _id: "$conversationId", count: { $sum: 1 } } },
    ]),
  ]);

  const lastById = new Map(
    lastMessages.map((m) => [String(m._id), m.doc])
  );
  const unreadById = new Map(
    unreadCounts.map((u) => [String(u._id), u.count as number])
  );

  // The "other user" is the customer when an admin is looking, and the agent
  // (or a generic Support identity) when the customer is looking.
  const counterpartIds = conversations.map((c) =>
    viewer.isAdmin ? String(c.customer) : String(c.agent || "")
  );
  const parties = await resolveParties(counterpartIds);

  return conversations.map((c) => {
    const last = lastById.get(String(c._id));
    const counterpartId = viewer.isAdmin
      ? String(c.customer)
      : String(c.agent || "");

    return {
      _id: String(c._id),
      participants: (c.participants || []).map(String),
      type: c.type,
      closed: c.closed,
      isGuest: c.isGuest,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      lastMessage: last
        ? {
            content: last.content,
            createdAt: last.createdAt,
            sender: String(last.sender),
            receiver: last.receiver ? String(last.receiver) : "",
          }
        : { content: "", createdAt: c.createdAt, sender: "", receiver: "" },
      unreadCount: unreadById.get(String(c._id)) || 0,
      otherUser: parties.get(counterpartId) || {
        fullName: viewer.isAdmin ? "Customer" : "United Fly Support",
        image: "",
      },
    };
  });
};

/** Serialises a message into the flat shape the client's `IMessage` expects. */
export const serializeMessage = (message: {
  _id: unknown;
  conversationId: unknown;
  sender: unknown;
  receiver?: unknown;
  content: string;
  image?: string;
  forwardedFrom?: unknown;
  replyTo?: unknown;
  referencedUser?: unknown;
  referencedProduct?: string;
  read: boolean;
  createdAt: Date;
}) => ({
  _id: String(message._id),
  conversationId: String(message.conversationId),
  sender: String(message.sender),
  receiver: message.receiver ? String(message.receiver) : "",
  content: message.content,
  image: message.image,
  forwardedFrom: message.forwardedFrom
    ? String(message.forwardedFrom)
    : undefined,
  replyTo: message.replyTo ? String(message.replyTo) : undefined,
  referencedUser: message.referencedUser
    ? String(message.referencedUser)
    : undefined,
  referencedProduct: message.referencedProduct,
  read: message.read,
  createdAt: message.createdAt,
});

/**
 * Finds the caller's open thread of `type`, creating one if the widget is
 * sending its first message (the client sends no `conversationId` then).
 */
export const findOrCreateConversation = async (
  viewer: ChatIdentity,
  type: string
) => {
  const existing = await Conversation.findOne({
    customer: viewer.id,
    type,
    closed: false,
  }).sort({ lastMessageAt: -1 });
  if (existing) return existing;

  const agentId = await findSupportAgentId();

  return Conversation.create({
    customer: viewer.id,
    agent: agentId || undefined,
    participants: agentId ? [viewer.id, agentId] : [viewer.id],
    type,
    isGuest: viewer.isGuest,
    lastMessageAt: new Date(),
  });
};
