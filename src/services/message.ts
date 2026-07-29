import {
  ForwardData,
  IConversation,
  IMessage,
  MessageData,
  ReplyData,
  ConversationData,
  MessageStart,
  MessageStartResponse,
} from "../types/message";
import { getBackendErrorMessage } from "../utils/error";
import apiChat from "./apiChat";

export const createMessageService = async (
  messageData: MessageStart
): Promise<MessageStartResponse> => {
  try {
    const res: { conversation: MessageStartResponse } = await apiChat.post(
      `/messages/conversations/start`,
      messageData
    );
    return res.conversation;
  } catch (error) {
    console.log("Error sending message:", getBackendErrorMessage(error));
    throw getBackendErrorMessage(error);
  }
};

export const sendMessageService = async (
  messageData: MessageData
): Promise<IMessage> => {
  try {
    const res: { message: IMessage } = await apiChat.post(
      `/messages/send`,
      messageData
    );
    return res.message;
  } catch (error) {
    console.log("Error sending message:", getBackendErrorMessage(error));
    throw getBackendErrorMessage(error);
  }
};

export const getMessagesService = async (
  conversationId: string
): Promise<IMessage[]> => {
  try {
    const response: { messages: IMessage[] } = await apiChat.get(
      `/messages/${conversationId}`
    );
    return response.messages;
  } catch (error) {
    console.log("Error getting message:", getBackendErrorMessage(error));
    throw getBackendErrorMessage(error);
  }
};

export const forwardMessageService = async (
  message: ForwardData
): Promise<IMessage> => {
  try {
    const res: { message: IMessage } = await apiChat.post(
      `/messages/forward`,
      message
    );
    return res.message;
  } catch (error) {
    console.log("Error forwarding message:", getBackendErrorMessage(error));
    throw getBackendErrorMessage(error);
  }
};

export const replyToMessageService = async (
  message: ReplyData
): Promise<IMessage> => {
  try {
    const res: { message: IMessage } = await apiChat.post(
      `/messages/reply`,
      message
    );
    return res.message;
  } catch (error) {
    console.log("Error replying message:", getBackendErrorMessage(error));
    throw getBackendErrorMessage(error);
  }
};

export const getConversationsService = async (
  type: string
): Promise<IConversation[]> => {
  try {
    const response: { conversations: IConversation[] } = await apiChat.get(
      `/messages/conversations/${type}`
    );
    return response.conversations;
  } catch (error) {
    console.log("Error fetching conversation:", getBackendErrorMessage(error));
    throw getBackendErrorMessage(error);
  }
};

/**
 * Marks the other party's messages in a thread as read. Replaces the
 * `markAsRead` socket event from the old realtime chat service — the server
 * derives who "the other party" is from the token.
 */
export const markMessagesReadService = async (
  conversationId: string
): Promise<void> => {
  try {
    await apiChat.post(`/messages/read`, { conversationId });
  } catch (error) {
    console.log("Error marking messages read:", getBackendErrorMessage(error));
  }
};

export const startConversationService = async (
  conversationData: ConversationData
): Promise<IConversation> => {
  try {
    const res: { conversation: IConversation } = await apiChat.post(
      `/messages/conversation`,
      conversationData
    );
    return res.conversation;
  } catch (error) {
    console.log("Error starting conversation:", getBackendErrorMessage(error));
    throw getBackendErrorMessage(error);
  }
};
