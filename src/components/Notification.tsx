"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Info, XCircle, X } from "lucide-react";
import { useNotificationStore } from "@/stores/useNotificationStore";

const NotificationComponent = () => {
  const { notifications, removeNotification } = useNotificationStore();
  const [localNotifications, setLocalNotifications] = useState<string[]>([]);

  useEffect(() => {
    const newNotificationIds = notifications
      .filter((notification) => !localNotifications.includes(notification.id))
      .map((notification) => notification.id);

    if (newNotificationIds.length > 0) {
      setLocalNotifications((prev) => [...prev, ...newNotificationIds]);
    }
  }, [notifications, localNotifications]);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    localNotifications.forEach((notificationId) => {
      const timeout = setTimeout(() => {
        removeNotification(notificationId);
        setLocalNotifications((prev) =>
          prev.filter((id) => id !== notificationId)
        );
      }, 5000);

      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [localNotifications, removeNotification]);

  const getIcon = (state: "info" | "error" | "success") => {
    switch (state) {
      case "success":
        return <CheckCircle className="size-4 !text-success-600" />;
      case "error":
        return <XCircle className="size-4 !text-error-600" />;
      default:
        return <Info className="size-4 !text-primary-600" />;
    }
  };

  const getVariant = (state: "info" | "error" | "success") => {
    switch (state) {
      case "error":
        return "destructive" as const;
      default:
        return "default" as const;
    }
  };

  return (
    <div className="fixed bottom-26 right-4 z-50 space-y-2 max-w-[80svw]">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
          >
            <Alert variant={getVariant(notification.state)}>
              {/* <CheckCircle2Icon /> */}
              {getIcon(notification.state)}
              <AlertTitle>{notification.title}</AlertTitle>
              <AlertDescription>{notification.description}</AlertDescription>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationComponent;
