"use client";

import React, { Suspense, useEffect, useState } from "react";
import moment from "moment";
import { useSearchParams } from "next/navigation";
import { IoSend } from "react-icons/io5";
import { CgChevronLeft } from "react-icons/cg";
import { useMessage } from "@/context/message";
import { useUser } from "@/context/user";
import { getDayLabel } from "@/utils/chat";
import Loading from "@/components/common/loading";
import {
  SkeletonConversationLoading,
  SkeletonMessageLoading,
} from "@/components/support/skeletons";
import { PageHeader } from "@/components/dashboard/table";
import { Eyebrow, StatusDot } from "@/components/ui";
import { cn } from "@/lib/cn";

function ConversationList({
  onSelect,
}: {
  onSelect: () => void;
}) {
  const {
    currentTab,
    conversations,
    loading,
    currentConversation,
    setCurrentConversation,
    markAsRead,
  } = useMessage();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = conversations.filter((conversation) =>
    conversation?.otherUser?.fullName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col border-r border-line-soft">
      <div className="p-4">
        <Eyebrow className="mb-3">{currentTab} inbox</Eyebrow>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations…"
          className="w-full rounded-control border border-line-strong bg-field px-3.5 py-2.5 text-sm text-fg outline-none transition-colors focus:border-accent"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-slim">
        {loading ? (
          <>
            <SkeletonConversationLoading />
            <SkeletonConversationLoading />
          </>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-faint">
            No conversations yet.
          </p>
        ) : (
          filtered.map((conversation) => (
            <button
              key={conversation._id}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors",
                conversation._id === currentConversation?._id
                  ? "bg-accent/12"
                  : "hover:bg-white/4"
              )}
              onClick={() => {
                setCurrentConversation(conversation);
                markAsRead(conversation._id);
                onSelect();
              }}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-140 from-accent to-[#2A2440] font-display text-xs font-semibold">
                {(conversation.otherUser?.fullName || "?")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="truncate">
                    {conversation.otherUser?.fullName}
                  </span>
                  {conversation.isGuest && (
                    <span className="shrink-0 rounded-full border border-gold/40 bg-gold/12 px-1.5 py-0.5 text-[9px] tracking-[0.08em] text-gold uppercase">
                      Guest
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block truncate text-xs text-dim">
                  {conversation.lastMessage?.content || "No messages yet"}
                </span>
              </span>

              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[11px] text-faint">
                  {conversation.lastMessage?.createdAt
                    ? moment(conversation.lastMessage.createdAt).calendar()
                    : ""}
                </span>
                {conversation.unreadCount > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-white">
                    {conversation.unreadCount}
                  </span>
                )}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function ChatArea({ onBack }: { onBack: () => void }) {
  const { user } = useUser();
  const {
    loadingMessage,
    messages,
    currentConversation,
    setCurrentConversation,
    isAnimating,
    sendMessage,
  } = useMessage();
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState({
    value: false,
    message: "",
    failed: false,
  });

  const handleMessageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentConversation || !messageInput) return;
    try {
      setSending({ value: true, message: messageInput, failed: false });
      setMessageInput("");
      await sendMessage({
        content: messageInput,
        type: currentConversation.type || "Support",
        conversationId: currentConversation._id,
      });
      setSending({ value: false, message: "", failed: false });
    } catch (error) {
      console.log(error);
      setSending((prev) => ({ ...prev, value: true, failed: true }));
    }
  };

  if (!currentConversation) {
    return (
      <div className="flex h-full flex-1 items-center justify-center px-6 text-center">
        <div>
          <Eyebrow className="mb-3">Support inbox</Eyebrow>
          <p className="m-0 text-lg text-dim">
            Select a conversation to start replying.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-line-soft px-4 py-3">
        <button
          onClick={() => {
            onBack();
            setCurrentConversation(null);
          }}
          className="cursor-pointer text-2xl text-dim md:hidden"
          aria-label="Back"
        >
          <CgChevronLeft />
        </button>
        <span className="flex size-9 items-center justify-center rounded-full bg-linear-140 from-accent to-[#2A2440] font-display text-xs font-semibold">
          {(currentConversation.otherUser?.fullName || "?")
            .slice(0, 2)
            .toUpperCase()}
        </span>
        <div>
          <div className="text-sm font-medium">
            {currentConversation.otherUser?.fullName}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-faint">
            <StatusDot tone="success" /> {currentConversation.type}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col-reverse overflow-y-auto px-4 py-4 transition-transform duration-500 scrollbar-slim md:px-8",
          isAnimating ? "-translate-y-2" : "translate-y-0"
        )}
        style={{ scrollBehavior: "smooth" }}
      >
        {sending.value && (
          <div className="mb-3 flex justify-end">
            <div className="max-w-[80%] rounded-xl rounded-br-sm border border-accent/35 bg-accent/22 px-3.5 py-2.5 text-sm">
              {sending.message}
              <span className="mt-1 block text-right text-[11px]">
                {sending.failed ? (
                  <span className="text-danger">Failed</span>
                ) : (
                  <span className="animate-pulse text-faint">Sending</span>
                )}
              </span>
            </div>
          </div>
        )}

        {loadingMessage ? (
          <SkeletonMessageLoading />
        ) : (
          messages
            .slice()
            .reverse()
            .map((message, index, array) => {
              const prevMessage = array[index + 1];
              const showDayLabel =
                !prevMessage ||
                getDayLabel(message.createdAt) !==
                  getDayLabel(prevMessage.createdAt);
              const mine = message.sender === user?._id;

              return (
                <div key={message._id}>
                  {showDayLabel && (
                    <div className="my-3 text-center font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
                      {getDayLabel(message.createdAt)}
                    </div>
                  )}
                  <div
                    className={cn(
                      "mb-3 flex",
                      mine ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed",
                        mine
                          ? "rounded-xl rounded-br-sm border border-accent/35 bg-accent/22 text-fg"
                          : "rounded-xl rounded-bl-sm bg-white/6 text-muted"
                      )}
                    >
                      {message.image && (
                        <img
                          src={message.image}
                          alt=""
                          className="mb-1.5 h-auto max-w-full rounded-lg object-contain"
                        />
                      )}
                      <div className="break-words">{message.content}</div>
                      <div className="mt-1 text-right text-[11px] text-faint">
                        {moment(message.createdAt).format("LT")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      <form
        onSubmit={handleMessageSubmit}
        className="flex items-center gap-3 border-t border-line-soft p-4"
      >
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-control border border-line-strong bg-field px-4 py-3 text-sm text-fg outline-none transition-colors focus:border-accent"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-control bg-accent px-4 py-3 text-white transition-colors hover:bg-accent-hover"
          aria-label="Send"
        >
          <IoSend size={18} />
        </button>
      </form>
    </div>
  );
}

function SupportInbox() {
  const searchParams = useSearchParams();
  const conversationId = searchParams?.get("conversation");
  const {
    currentTab,
    conversations,
    getConversations,
    setCurrentConversation,
    setChatActive,
  } = useMessage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    getConversations("Support");
    setChatActive(true);

    return () => {
      setCurrentConversation(null);
      setChatActive(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  useEffect(() => {
    if (conversationId) {
      const match = conversations.find(
        (conversation) => conversation._id.toString() === conversationId
      );
      if (match) setCurrentConversation(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, conversations]);

  return (
    <div>
      <PageHeader
        title="Support inbox"
        subtitle="Replies reach the customer within a few seconds"
      />

      <div className="relative flex h-[calc(100vh-260px)] min-h-[480px] overflow-hidden rounded-card border border-line bg-panel">
        <div
          className={cn(
            "absolute inset-0 z-20 transition-transform duration-300 md:relative md:w-2/5 md:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="h-full bg-panel">
            <ConversationList onSelect={() => setIsSidebarOpen(false)} />
          </div>
        </div>

        <ChatArea onBack={() => setIsSidebarOpen(true)} />
      </div>
    </div>
  );
}

export default function Support() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loading />
        </div>
      }
    >
      <SupportInbox />
    </Suspense>
  );
}
