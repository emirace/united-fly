"use client";

import { useEffect, useState } from "react";
import { RiCustomerService2Fill } from "react-icons/ri";
import { CgChevronDown, CgChevronLeft } from "react-icons/cg";
import { useTranslations } from "next-intl";
import { useToastNotification } from "@/context/toastNotification";
import { useUser } from "@/context/user";
import { useMessage } from "@/context/message";
import { loginGuestService } from "@/services/user";
import { IGuestUser, IUser } from "@/types/user";
import { StatusDot } from "@/components/ui";
import Chat from "./chat";
import FAQ from "./faq";
import Form from "./form";

const articles: { _id: string; topic: string }[] = [];

export default function Support() {
  const t = useTranslations("support");
  const { user: defaultUser } = useUser();
  const { setChatActive } = useMessage();
  const { addNotification } = useToastNotification();
  const [showSupport, setShowSupport] = useState(false);
  const [screen, setScreen] = useState("home");
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    if (showSupport) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showSupport]);

  // Polling only runs while a chat surface is open.
  useEffect(() => {
    setChatActive(showSupport && screen === "chat");
    return () => setChatActive(false);
  }, [showSupport, screen, setChatActive]);

  const loginGuest = async (value: IGuestUser) => {
    const { email, fullName } = value;
    const res = await loginGuestService({ email, fullName });
    if (res) setUser(res);
  };

  // A signed-in visitor chats as themselves; anyone else is re-identified from
  // the guest details they gave the widget last time.
  useEffect(() => {
    if (defaultUser) {
      setUser(defaultUser);
      return;
    }
    const email = localStorage.getItem("guestUserEmail");
    const fullName = localStorage.getItem("guestUserFullName");
    if (email && fullName) {
      loginGuest({ email, fullName }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultUser]);

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return (
          <FAQ
            articles={articles}
            setScreen={setScreen}
            setShowSupport={setShowSupport}
            user={user}
          />
        );
      case "form":
        return (
          <Form
            setScreen={setScreen}
            setUser={setUser}
            loginGuest={loginGuest}
          />
        );
      case "chat":
        return <Chat user={user} />;
      default:
        return null;
    }
  };

  const handleToggle = () => {
    if (defaultUser && defaultUser.role === "Admin") {
      addNotification({ message: t("adminNotice"), error: true });
      return;
    }
    setShowSupport(!showSupport);
  };

  return (
    <div
      className={`fixed z-60 ${
        showSupport
          ? "inset-0 md:top-auto md:end-7 md:bottom-7 md:start-auto"
          : "end-6 bottom-6"
      }`}
    >
      {showSupport && (
        <div className="flex h-full w-full flex-col overflow-hidden border border-line-strong bg-raised shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] md:h-[80vh] md:max-h-[620px] md:w-[24rem] md:rounded-card">
          <div className="flex items-center gap-2.5 border-b border-line-soft px-4 py-3.5">
            {screen !== "home" ? (
              <button
                onClick={() => setScreen("home")}
                className="cursor-pointer text-2xl text-dim transition-colors hover:text-fg"
                aria-label={t("back")}
              >
                <CgChevronLeft />
              </button>
            ) : (
              <StatusDot tone="success" />
            )}

            <div className="min-w-0">
              <div className="font-display text-sm font-semibold">
                {screen === "home"
                  ? t("greeting", { name: user ? user.fullName : t("there") })
                  : t("title")}
              </div>
              <div className="mt-0.5 text-[11px] text-faint">
                {t("replyTime")}
              </div>
            </div>

            <button
              onClick={handleToggle}
              className="ms-auto cursor-pointer text-2xl text-dim transition-colors hover:text-fg"
              aria-label={t("close")}
            >
              <CgChevronDown />
            </button>
          </div>

          {renderScreen()}
        </div>
      )}

      {!showSupport && (
        <button
          onClick={handleToggle}
          className="flex size-13 cursor-pointer items-center justify-center rounded-full bg-accent text-white shadow-[0_16px_36px_-12px_rgba(110,91,245,0.9)] transition-colors hover:bg-accent-hover"
          aria-label={t("open")}
        >
          <RiCustomerService2Fill className="text-2xl" />
        </button>
      )}
    </div>
  );
}
