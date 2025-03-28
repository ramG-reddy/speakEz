import React, { createContext, useContext, useState } from "react";
import {
  NotificationBanner,
  NotificationType,
} from "@/components/NotificationBanner";

type Notification = {
  message: string;
  type: NotificationType;
  duration?: number;
  id: string;
};

type NotificationContextType = {
  showNotification: (
    message: string,
    type?: NotificationType,
    duration?: number
  ) => void;
  hideNotification: () => void;
};

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
  hideNotification: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [visible, setVisible] = useState(false);

  const showNotification = (
    message: string,
    type: NotificationType = "info",
    duration = 3000
  ) => {
    // Hide any existing notification first
    if (visible) {
      setVisible(false);
      setTimeout(() => {
        setNotification({
          message,
          type,
          duration,
          id: Date.now().toString(),
        });
        setVisible(true);
      }, 300);
    } else {
      setNotification({
        message,
        type,
        duration,
        id: Date.now().toString(),
      });
      setVisible(true);
    }
  };

  const hideNotification = () => {
    setVisible(false);
  };

  return (
    <NotificationContext.Provider
      value={{ showNotification, hideNotification }}
    >
      {children}
      {notification && (
        <NotificationBanner
          message={notification.message}
          type={notification.type}
          visible={visible}
          duration={notification.duration}
          onDismiss={hideNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
