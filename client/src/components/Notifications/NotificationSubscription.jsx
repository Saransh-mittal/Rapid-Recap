import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

const NotificationSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const subscribe = async () => {
    setIsLoading(true);
    try {
      const serviceWorker = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      const subscription = await serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          "BMtN9qkLo6TLtMK1erTFjiH_2Ivu9qd9cLpq3Cyiq0e8FHiDHtB022jiOB9d3HoocouCVUf6-scRF08RDzZ_kLY"
        ), // Use your public key here
      });
      await fetch("/api/subs/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });
      setSubscription(subscription);
      Cookies.set("notificationSubscribed", true, { expires: 365 }); // expires in 1 year (permanently)
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const notificationShown = Cookies.get("notificationShown");
    const notificationSubscribed = Cookies.get("notificationSubscribed");
    const currentPermission = Notification.permission;

    if (
      !notificationShown &&
      !notificationSubscribed &&
      currentPermission !== "denied"
    ) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          subscribe();
        }
      });
      Cookies.set("notificationShown", true, { expires: 7 }); // expires in 7 days
    } else if (notificationSubscribed === "true") {
      // User has already subscribed, no need to prompt again
    } else if (currentPermission === "denied" && !notificationShown) {
      Cookies.set("notificationShown", true, { expires: 7 });
    }

    // Listen for changes to Notification permission
    const handlePermissionChange = () => {
      const newPermission = Notification.permission;
      // console.log(newPermission);
      if (newPermission === "granted") {
        subscribe();
      }
    };

    Notification.requestPermission().then(handlePermissionChange);

    // Add event listener for permissionchange event
    document.addEventListener("permissionchange", handlePermissionChange);

    return () => {
      // Remove event listener when component unmounts
      document.removeEventListener("permissionchange", handlePermissionChange);
    };
  }, []);

  return null; // No need to return any UI component
};

export default NotificationSubscription;
