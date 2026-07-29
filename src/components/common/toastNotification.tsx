"use client";

import React, { useEffect } from "react";
import { FiBell } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { useToastNotification } from "@/context/toastNotification";

const ToastNotification: React.FC = () => {
  const { notifications, removeNotification } = useToastNotification();

  useEffect(() => {
    const notificationTimeouts: ReturnType<typeof setTimeout>[] = [];

    notifications.forEach((notification) => {
      if (!notification.action) {
        notificationTimeouts.push(
          setTimeout(() => removeNotification(notification.id), 5000)
        );
      }
    });

    return () => {
      notificationTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, [notifications, removeNotification]);

  const notificationsWithAction = notifications.filter((n) => n.action);
  const notificationsWithoutAction = notifications.filter((n) => !n.action);

  return (
    <>
      <div className="fixed top-4 right-4 z-[100]">
        <div className="flex flex-col gap-2">
          {notificationsWithAction.map((notification) => (
            <div
              key={notification.id}
              className="my-1 flex items-center justify-between gap-4 rounded-card border border-accent/40 bg-raised p-4 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.9)]"
            >
              <FiBell className="text-accent-tint" />
              <div className="space-y-3">
                <div className="text-sm text-fg">{notification.message}</div>
                <button
                  onClick={() => {
                    notification.action?.();
                    removeNotification(notification.id);
                  }}
                  className="cursor-pointer rounded-control bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
                >
                  {notification.buttonText}
                </button>
              </div>
              <IoMdClose
                className="cursor-pointer text-faint transition-colors hover:text-fg"
                onClick={() => removeNotification(notification.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="fixed top-4 left-1/2 z-[100] -translate-x-1/2">
        <div className="flex flex-col gap-2">
          {notificationsWithoutAction.map((notification) => (
            <div
              key={notification.id}
              className={`my-1 rounded-control border px-4 py-2.5 text-center text-sm shadow-[0_24px_48px_-24px_rgba(0,0,0,0.9)] ${
                notification.error
                  ? "border-danger/40 bg-danger/15 text-danger"
                  : "border-success/35 bg-success/12 text-success"
              }`}
            >
              {notification.message}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ToastNotification;
