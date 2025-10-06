"use client";
import { useEffect } from "react";

export default function PWARegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // DISABLED FOR DEVELOPMENT - Service worker interferes with HMR
      // Unregister any existing service workers
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            console.log("Service Worker unregistered:", success);
          });
        }
      });

      // Handle offline/online status
      const handleOnline = () => {
        console.log("App is online");
      };

      const handleOffline = () => {
        console.log("App is offline");
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  return null;
}
