import { create } from "zustand";

interface Notification {
  title: string;
  description: string;
  state: "info" | "error" | "success";
}

type NotificationStore = {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: number) => void;
};

const useNotification = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({ notifications: [...state.notifications, notification] })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (n) => n !== state.notifications[id]
      ),
    })),
}));

export default useNotification;
