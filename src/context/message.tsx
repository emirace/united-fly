"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
  useContext,
} from "react";
import {
  ForwardData,
  IConversation,
  IMessage,
  MessageData,
  MessageStart,
  MessageStartResponse,
  ReplyData,
} from "../types/message";
import {
  createMessageService,
  forwardMessageService,
  getConversationsService,
  getMessagesService,
  markMessagesReadService,
  replyToMessageService,
  sendMessageService,
} from "../services/message";

/**
 * The support chat used to run on a separate socket.io service. It now lives in
 * this app's API routes, so delivery is polled rather than pushed:
 *
 *  - the open thread refreshes every 5s,
 *  - the conversation list every 10s,
 *
 * and only while a chat surface is mounted (`setChatActive`). Typing
 * indicators have no polling equivalent, so `isTypingList` stays on the context
 * for call-site compatibility but is always empty.
 */
const MESSAGE_POLL_MS = 5000;
const CONVERSATION_POLL_MS = 10000;

interface Props {
  children?: ReactNode;
}

interface MessageContextType {
  loading: boolean;
  loadingMessage: boolean;
  isTypingList: { value: boolean; id: string }[];
  error: string;
  messages: IMessage[];
  conversations: IConversation[];
  currentConversation: IConversation | null;
  currentTab: string;
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
  setChatActive: (value: boolean) => void;
  handleTabChange: (tab: string) => void;
  setCurrentConversation: (conversation: IConversation | null) => void;
  createMessage: (message: MessageStart) => Promise<MessageStartResponse>;
  sendMessage: (message: MessageData) => Promise<void>;
  getMessages: (receiver: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  forwardMessage: (message: ForwardData) => Promise<void>;
  replyToMessage: (message: ReplyData) => Promise<void>;
  getConversations: (type: string) => Promise<void>;
}

export const MessageContext = createContext<MessageContextType | undefined>(
  undefined
);

export const MessageProvider: React.FC<Props> = ({ children }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<boolean>(false);
  const [currentConversation, setCurrentConversation] =
    useState<IConversation | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("Support");
  const [isAnimating, setIsAnimating] = useState(false);
  const [chatActive, setChatActive] = useState(false);

  // Typing indicators required the realtime channel; kept empty so consumers
  // that read this list keep working.
  const isTypingList: { value: boolean; id: string }[] = [];

  // Read inside intervals without making them a dependency. Mirrored in an
  // effect rather than assigned during render, which would be a side effect.
  const currentTabRef = useRef(currentTab);
  const conversationRef = useRef<IConversation | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentTabRef.current = currentTab;
    conversationRef.current = currentConversation;
  }, [currentTab, currentConversation]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleError = (error: any) => {
    setLoading(false);
    if (error === "Token expired" || error === "Invalid token") {
      setError("");
    } else {
      setError(error || "An error occurred.");
    }
  };

  const markAsRead = useCallback(async (conversationId: string) => {
    await markMessagesReadService(conversationId);
  }, []);

  const getMessages = useCallback(async (receiver: string) => {
    try {
      setLoadingMessage(true);
      const receivedMessages = await getMessagesService(receiver);
      setMessages(receivedMessages);
      lastMessageIdRef.current =
        receivedMessages[receivedMessages.length - 1]?._id ?? null;
      setLoadingMessage(false);
      await markMessagesReadService(receiver);
    } catch (error) {
      setLoadingMessage(false);
      handleError(error);
    }
  }, []);

  const reloadConversation = useCallback(async (tab: string) => {
    try {
      const res = await getConversationsService(tab);
      setConversations(res);
    } catch (error) {
      console.log("Error reloading conversations:", error);
    }
  }, []);

  // Load the thread whenever the selected conversation changes.
  useEffect(() => {
    if (currentConversation) {
      getMessages(currentConversation._id);
    } else {
      setMessages([]);
      lastMessageIdRef.current = null;
    }
  }, [currentConversation, getMessages]);

  // Poll the open thread for incoming messages.
  useEffect(() => {
    if (!chatActive || !currentConversation) return;

    const conversationId = currentConversation._id;
    const interval = setInterval(async () => {
      try {
        const latest = await getMessagesService(conversationId);
        if (conversationRef.current?._id !== conversationId) return;

        const newestId = latest[latest.length - 1]?._id ?? null;
        if (newestId === lastMessageIdRef.current) return;

        lastMessageIdRef.current = newestId;
        setMessages(latest);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
        await markMessagesReadService(conversationId);
        reloadConversation(
          conversationRef.current?.type || currentTabRef.current
        );
      } catch (error) {
        console.log("Error polling messages:", error);
      }
    }, MESSAGE_POLL_MS);

    return () => clearInterval(interval);
  }, [chatActive, currentConversation, reloadConversation]);

  // Poll the conversation list so new threads and unread counts stay current.
  useEffect(() => {
    if (!chatActive) return;

    const interval = setInterval(() => {
      reloadConversation(conversationRef.current?.type || currentTabRef.current);
    }, CONVERSATION_POLL_MS);

    return () => clearInterval(interval);
  }, [chatActive, reloadConversation]);

  const createMessage = async (message: MessageStart) => {
    try {
      return await createMessageService(message);
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const sendMessage = async (message: MessageData) => {
    try {
      const res = await sendMessageService(message);
      setMessages((prevMessages) => [...prevMessages, res]);
      lastMessageIdRef.current = res._id;

      // The widget's first message creates the thread server-side, so refresh
      // the list and adopt the new conversation as the current one.
      const type = currentConversation?.type || message.type || currentTab;
      const list = await getConversationsService(type);
      setConversations(list);
      if (!currentConversation) {
        const opened = list.find((c) => c._id === res.conversationId);
        if (opened) setCurrentConversation(opened);
      }
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const forwardMessage = async (message: ForwardData) => {
    try {
      const res = await forwardMessageService(message);
      setMessages((prevMessages) => [...prevMessages, res]);
    } catch (error) {
      handleError(error);
    }
  };

  const replyToMessage = async (message: ReplyData) => {
    try {
      const res = await replyToMessageService(message);
      setMessages((prevMessages) => [...prevMessages, res]);
    } catch (error) {
      handleError(error);
    }
  };

  const getConversations = async (type: string) => {
    try {
      setLoading(true);
      const res = await getConversationsService(type);
      setConversations(res);
      setLoading(false);
    } catch (error) {
      handleError(error);
    }
  };

  const handleTabChange = (type: string) => {
    setCurrentTab(type);
  };

  return (
    <MessageContext.Provider
      value={{
        messages,
        conversations,
        error,
        loading,
        currentConversation,
        isTypingList,
        currentTab,
        loadingMessage,
        isAnimating,
        setIsAnimating,
        setChatActive,
        handleTabChange,
        setCurrentConversation,
        sendMessage,
        getMessages,
        markAsRead,
        forwardMessage,
        replyToMessage,
        getConversations,
        createMessage,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};

export default MessageProvider;
