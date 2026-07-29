"use client";

// ToastNotificationContext.tsx
import React, {
  createContext,
  useState,
  ReactNode,
  useRef,
  useContext,
} from "react";

interface Props {
  children: ReactNode;
}
interface INotification {
  id: string;
  message: string;
  action?: () => void;
  buttonText?: string;
  error?: boolean;
  meta?: string;
}

interface ToastNotificationContextProps {
  addNotification: (data: {
    message: string;
    buttonText?: string;
    error?: boolean;
    action?: () => void;
  }) => void;
  removeNotification: (id: string) => void;
  notifications: INotification[];
}

export const ToastNotificationContext = createContext<
  ToastNotificationContextProps | undefined
>(undefined);

export const ToastNotificationProvider: React.FC<Props> = ({ children }) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const notificationIdCounter = useRef(0);

  const addNotification = (data: {
    message: string;
    buttonText?: string;
    error?: boolean;
    action?: () => void;
    meta?: string;
  }) => {
    const { message, action, buttonText, error, meta } = data;
    const id = notificationIdCounter.current.toString();
    notificationIdCounter.current += 1;
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      { id, message, action, buttonText, error, meta },
    ]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  return (
    <ToastNotificationContext.Provider
      value={{ addNotification, removeNotification, notifications }}
    >
      {children}
    </ToastNotificationContext.Provider>
  );
};

export const useToastNotification = () => {
  const context = useContext(ToastNotificationContext);
  if (!context) {
    throw new Error(
      "useToastNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
