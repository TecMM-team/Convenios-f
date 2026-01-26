import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";

export interface NotificationContextType {
    socket: Socket | null;
    notifications: any[];
    addNotification: (notification: any) => void;
    clearNotifications: () => void;
}

export const NotificationContext = createContext<NotificationContextType>({
    socket: null,
    notifications: [],
    addNotification: () => { },
    clearNotifications: () => { },
});

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
  if (!context) {
      throw new Error("useNotificationContext debe usarse dentro de un NotificationProvider");
  }
  return context;
};
