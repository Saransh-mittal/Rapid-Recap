import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";

const NotificationSubscription = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeniedMessage, setShowDeniedMessage] = useState(false);
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
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
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const notificationShown = Cookies.get("notificationShown");
    const notificationSubscribed = Cookies.get("notificationSubscribed");
    const currentPermission = Notification
      ? Notification?.permission
      : "denied";
    if (
      !notificationShown &&
      !notificationSubscribed &&
      currentPermission !== "denied"
    ) {
      onOpen();
      Cookies.set("notificationShown", true, { expires: 7 }); // expires in 7 days
    } else if (notificationSubscribed === "true") {
      // User has already subscribed, no need to prompt again
      onClose();
    } else if (currentPermission === "denied" && !notificationShown) {
      onOpen();
      setShowDeniedMessage(true);
      Cookies.set("notificationShown", true, { expires: 7 });
    }

    // Listen for changes to Notification permission
    const handlePermissionChange = () => {
      const newPermission = Notification ? Notification?.permission : "denied";

      if (newPermission === "granted") {
        // User has enabled notifications after previously denying
        subscribe();

        onClose();
      } else if (newPermission !== "denied") {
        // User has changed their mind, ask to subscribe again
        onOpen();
      }
    };

    Notification &&
      Notification?.requestPermission()?.then(handlePermissionChange);

    // Add event listener for permissionchange event
    document.addEventListener("permissionchange", handlePermissionChange);

    return () => {
      // Remove event listener when component unmounts
      document.removeEventListener("permissionchange", handlePermissionChange);
    };
  }, [onOpen, onClose]);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Allow Notification
          </AlertDialogHeader>

          <AlertDialogBody>
            {showDeniedMessage && (
              <p>
                It seems like you have previously turned off notifications.
                Please go to your browser settings to enable notifications for
                our site.
              </p>
            )}
            {!showDeniedMessage && (
              <p>
                Stay in the loop with our notifications! Get the latest news,
                app updates, leaderboard rankings, and more delivered right to
                your device. Click "Allow" in your browser to stay informed and
                stay ahead.
              </p>
            )}
          </AlertDialogBody>

          <AlertDialogFooter>
            {showDeniedMessage ? (
              <Button ref={cancelRef} onClick={onClose} isDisabled={isLoading}>
                Close
              </Button>
            ) : (
              <>
                <Button
                  ref={cancelRef}
                  onClick={onClose}
                  isDisabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={subscribe}
                  ml={3}
                  isLoading={isLoading}
                >
                  Allow
                </Button>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default NotificationSubscription;
