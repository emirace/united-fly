"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import moment from "moment";
import { useTranslations } from "next-intl";
import { FaPaperPlane } from "react-icons/fa";
import { GrAttachment } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { useToastNotification } from "@/context/toastNotification";
import { useUser } from "@/context/user";
import { useMessage } from "@/context/message";
import { getConversationsService } from "@/services/message";
import { compressImageUpload } from "@/utils/image";
import { getDayLabel } from "@/utils/chat";
import { IUser } from "@/types/user";
import Loading from "@/components/common/loading";
import { SkeletonMessageLoading } from "./skeletons";

interface ChatProps {
  user: IUser | null;
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  const t = useTranslations("support.chat");
  const {
    loadingMessage,
    messages,
    currentConversation,
    setCurrentConversation,
    isAnimating,
    sendMessage,
  } = useMessage();
  const { user: loginUser } = useUser();
  const { addNotification } = useToastNotification();
  const [messageInput, setMessageInput] = useState<string>("");
  const [sending, setSending] = useState({
    value: false,
    image: "",
    message: "",
    failed: false,
  });
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const getConversations = async () => {
      try {
        setLoading(true);
        const res = await getConversationsService("Support");
        setCurrentConversation(res[0] || null);
      } catch (error) {
        addNotification({ message: error as string, error: true });
      } finally {
        setLoading(false);
      }
    };
    getConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    setMessageInput(sending.message);
    setImage(sending.image);
    setSending((prev) => ({
      ...prev,
      value: false,
      failed: false,
      message: "",
    }));
  };

  const handleMessageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageInput && !image) return;
    try {
      setSending({ value: true, image, message: messageInput, failed: false });
      setMessageInput("");
      setImage("");
      await sendMessage({
        image,
        content: messageInput,
        type: "Support",
        conversationId: currentConversation?._id,
      });
      setSending({ value: false, image: "", message: "", failed: false });
    } catch (error) {
      console.log(error);
      setSending((prev) => ({ ...prev, value: true, failed: true }));
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) throw Error("No image found");

      setImage(await compressImageUpload(file, 1024));
      addNotification({ message: t("imageUploaded") });
    } catch {
      addNotification({ message: t("imageFailed"), error: true });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        className={`flex flex-1 flex-col-reverse overflow-y-auto px-4 pt-2 pb-1 transition-transform duration-500 scrollbar-slim ${
          isAnimating ? "-translate-y-2" : "translate-y-0"
        }`}
        style={{ scrollBehavior: "smooth" }}
      >
        {sending.value && (
          <div className="mb-3 flex justify-end">
            <div className="max-w-[82%] rounded-xl rounded-br-sm border border-accent/35 bg-accent/22 px-3 py-2.5 text-[13px] leading-relaxed">
              {sending.image && (
                <img
                  src={sending.image}
                  alt=""
                  className="mb-1.5 h-auto max-w-full rounded-lg object-contain"
                />
              )}
              {sending.message}
              <span className="mt-1 block text-end text-[11px]">
                {sending.failed ? (
                  <span className="text-danger">
                    {t("failed")}{" "}
                    <button
                      className="cursor-pointer underline"
                      onClick={handleRetry}
                    >
                      {t("retry")}
                    </button>
                  </span>
                ) : (
                  <span className="animate-pulse text-faint">
                    {t("sending")}
                  </span>
                )}
              </span>
            </div>
          </div>
        )}

        {loadingMessage || loading ? (
          <SkeletonMessageLoading />
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-faint">
            {t("empty")}
          </p>
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
                    className={`mb-3 flex ${
                      mine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[82%] px-3 py-2.5 text-[13px] leading-relaxed ${
                        mine
                          ? "rounded-xl rounded-br-sm border border-accent/35 bg-accent/22 text-fg"
                          : "rounded-xl rounded-bl-sm bg-white/6 text-muted"
                      }`}
                    >
                      {message.image && (
                        <img
                          src={message.image}
                          alt=""
                          className="mb-1.5 h-auto max-w-full rounded-lg object-contain"
                        />
                      )}
                      <div className="break-words">{message.content}</div>
                      <div className="mt-1 text-end text-[11px] text-faint">
                        {moment(message.createdAt).format("LT")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {image && (
        <div className="z-20 flex w-full items-center justify-between border-t border-line-soft bg-field px-4 py-2">
          <img src={image} alt="" className="size-10 rounded object-cover" />
          <IoMdClose
            size={20}
            className="cursor-pointer text-faint hover:text-fg"
            onClick={() => setImage("")}
          />
        </div>
      )}

      <form
        onSubmit={handleMessageSubmit}
        className="flex items-center gap-2 border-t border-line-soft px-3 py-3"
      >
        <input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="flex-1 rounded-control border border-line-strong bg-field px-3 py-2.5 text-[13px] text-fg outline-hidden transition-colors focus:border-accent"
          placeholder={t("placeholder")}
        />
        <div className="flex items-center gap-3">
          {loginUser && (
            <label htmlFor="support-upload" className="cursor-pointer">
              {uploading ? (
                <Loading size="sm" />
              ) : (
                <GrAttachment className="text-dim transition-colors hover:text-fg" />
              )}
              <input
                type="file"
                id="support-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleImageUpload(e);
                  e.target.value = "";
                }}
              />
            </label>
          )}
          <button
            type="submit"
            className="cursor-pointer rounded-control bg-accent px-3 py-2.5 text-white transition-colors hover:bg-accent-hover"
            aria-label={t("send")}
          >
            <FaPaperPlane size={13} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
