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

const NotificationSubscription = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [subscription, setSubscription] = useState(null);
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
      localStorage.removeItem("notificationDismissedAt");
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const notificationShown = localStorage.getItem("notificationShown");
    const notificationDismissedAt = localStorage.getItem(
      "notificationDismissedAt"
    );
    const delayTimeInMilliseconds = 7 * 24 * 60 * 60 * 1000; // 7 days delay

    if (
      !notificationShown ||
      (notificationDismissedAt &&
        Date.now() - Number(notificationDismissedAt) >= delayTimeInMilliseconds)
    ) {
      onOpen();
      localStorage.setItem("notificationShown", true);
    }
  }, [onOpen]);

  const dismiss = () => {
    localStorage.setItem("notificationDismissedAt", Date.now());
    onClose();
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={dismiss}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Allow Notification
          </AlertDialogHeader>

          <AlertDialogBody>
            Stay in the loop with our notifications! Get the latest news, app
            updates, leaderboard rankings, and more delivered right to your
            device. Click "Allow" in your browser to stay informed and stay
            ahead.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={dismiss}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={subscribe} ml={3}>
              Allow
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default NotificationSubscription;
