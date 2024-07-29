import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Box, ChakraProvider, CloseButton } from "@chakra-ui/react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  List,
  ListItem,
  ListIcon,
  VStack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { MdCheckCircle, MdError } from "react-icons/md";

const NotificationSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructionType, setInstructionType] = useState("site");
  const [steps, setSteps] = useState({
    browserSupport: null,
    browserEnabled: null,
    sitePermission: null,
    backendSubscribed: null,
  });
  const [globalNotificationsAllowed, setGlobalNotificationsAllowed] =
    useState(true);
  const [isAlertVisible, setIsAlertVisible] = useState(true);

  const handleCloseAlert = () => {
    setIsAlertVisible(false);
    setShowInstructions(false);
    Cookies.set("lastNotificationPrompt", new Date().getTime().toString(), {
      expires: 7,
    });
  };

  const updateStep = (step, value) => {
    setSteps((prev) => ({ ...prev, [step]: value }));
  };

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

  const checkBrowserNotificationSupport = () => {
    const isSupported = "Notification" in window;
    updateStep("browserSupport", isSupported);
    return isSupported;
  };

  const checkBrowserNotificationEnabled = async () => {
    if (!checkBrowserNotificationSupport()) return false;

    try {
      const permission = await Notification.requestPermission();
      const isEnabled = permission === "granted";
      updateStep("browserEnabled", isEnabled);
      if (!isEnabled) {
        await unsubscribe();
      }

      if (Notification.permission === "granted") {
        updateStep("browserEnabled", true);
        return true;
      } else if (Notification.permission === "denied") {
        updateStep("browserEnabled", false);
        await unsubscribe();
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setGlobalNotificationsAllowed(false);
      updateStep("browserEnabled", false);
      await unsubscribe();
      return false;
    }
  };

  const createSubscription = async () => {
    console.log("Creating subscription...");
    const serviceWorker = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    return await serviceWorker.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        "BMtN9qkLo6TLtMK1erTFjiH_2Ivu9qd9cLpq3Cyiq0e8FHiDHtB022jiOB9d3HoocouCVUf6-scRF08RDzZ_kLY"
      ),
    });
  };

  const checkBackendSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } else {
        console.log("Service worker already registered.");
      }
      const readyRegistration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Service Worker ready timeout")),
            5000
          )
        ),
      ]);

      const subscription =
        await readyRegistration.pushManager.getSubscription();

      if (!subscription) {
        updateStep("backendSubscribed", false);
        return { isSubscribed: false, hasOtherSubscription: false };
      }

      const response = await fetch("/api/subs/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      if (!response.ok) throw new Error("Failed to check backend subscription");

      const data = await response.json();
      updateStep("backendSubscribed", data.isSubscribed);
      return {
        isSubscribed: data.isSubscribed,
        hasOtherSubscription: data.hasOtherSubscription,
      };
    } catch (error) {
      console.log("Backend subscription check error:", error);
      updateStep("backendSubscribed", false);
      return { isSubscribed: false, hasOtherSubscription: false };
    }
  };

  const sendSubscriptionToBackend = async (subscription) => {
    try {
      const response = await fetch("/api/subs/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });
      if (!response.ok) {
        throw new Error("Failed to send subscription to backend");
      }
    } catch (error) {
      console.log("Backend subscription error:", error);
      throw error;
    }
  };

  const subscribe = async () => {
    setIsLoading(true);
    try {
      const subscription = await createSubscription();
      await sendSubscriptionToBackend(subscription);
      setSubscription(subscription);
      updateStep("sitePermission", true);
      updateStep("backendSubscribed", true);
      Cookies.set("notificationSubscribed", "true", { expires: 365 });
      Cookies.set("subscriptionComplete", "true", { expires: 365 });
      setShowInstructions(false);
    } catch (error) {
      console.error("Subscription error:", error);
      updateStep("sitePermission", false);
      updateStep("backendSubscribed", false);
      Cookies.remove("subscriptionComplete");
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await sendUnsubscriptionToBackend(subscription.endpoint);
        }
      }
      Cookies.remove("notificationSubscribed");
      Cookies.remove("subscriptionComplete");
      setSubscription(null);
      updateStep("sitePermission", false);
      updateStep("backendSubscribed", false);
    } catch (error) {
      console.error("Error unsubscribing:", error);
    }
  };

  const sendUnsubscriptionToBackend = async (endpoint) => {
    try {
      const response = await fetch("/api/subs/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint }),
      });
      if (!response.ok) {
        throw new Error("Failed to send unsubscription to backend");
      }
    } catch (error) {
      console.error("Backend unsubscription error:", error);
      throw error;
    }
  };

  const checkAllSteps = async () => {
    const lastPrompt = Cookies.get("lastNotificationPrompt");
    const currentTime = new Date().getTime();
    const isBrowserSupported = checkBrowserNotificationSupport();
    const isBrowserEnabled = await checkBrowserNotificationEnabled();
    const { isSubscribed: backendSubscribed, hasOtherSubscription } =
      await checkBackendSubscription();

    if (
      (lastPrompt &&
        currentTime - parseInt(lastPrompt) < 7 * 24 * 60 * 60 * 1000) ||
      (isBrowserSupported && isBrowserEnabled && backendSubscribed)
    ) {
      setShowInstructions(false);
    } else {
      setShowInstructions(true);
      Cookies.set("lastNotificationPrompt", currentTime.toString(), {
        expires: 7,
      });
    }
    Cookies.remove("subscriptionComplete");

    if (!isBrowserSupported) {
      setInstructionType("browser");
      return;
    }

    if (!isBrowserEnabled) {
      setInstructionType(globalNotificationsAllowed ? "site" : "global");
      return;
    }

    updateStep("sitePermission", backendSubscribed);

    if (!backendSubscribed) {
      if (hasOtherSubscription) {
        console.log("User is subscribed on another device/browser");
      }
      await subscribe();
    } else {
      Cookies.set("notificationSubscribed", "true", { expires: 365 });
      Cookies.set("subscriptionComplete", "true", { expires: 365 });
      setShowInstructions(false);
    }
  };

  useEffect(() => {
    checkAllSteps();
  }, []);

  const StepStatus = ({ step, label }) => (
    <ListItem>
      <ListIcon
        as={step === isLoading ? Spinner : step ? MdCheckCircle : MdError}
        color={step === isLoading ? "blue.500" : step ? "green.500" : "red.500"}
      />
      <Text as={step === false ? "del" : "span"}>{label}</Text>
      {step === null && " (Checking...)"}
    </ListItem>
  );

  const content = (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="9999"
      background={"transparent"}
    >
      <Alert
        status="warning"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="auto"
        padding={4}
        w={{ base: "85%", md: "50%" }}
        mt={"20px"}
        marginX="auto"
        color={"black"}
        borderRadius={"xl"}
      >
        <CloseButton
          position="absolute"
          right="8px"
          top="8px"
          onClick={handleCloseAlert}
        />
        <AlertIcon
          boxSize="40px"
          mr={0}
        />
        <AlertTitle
          mt={4}
          mb={3}
          fontSize="lg"
        >
          Enable Notifications for Rapid Recap
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          <VStack
            spacing={3}
            align="stretch"
          >
            <List
              spacing={3}
              p={0}
            >
              <StepStatus
                step={steps.browserSupport}
                label="Browser Supports Notifications"
              />
              <StepStatus
                step={steps.browserEnabled}
                label="Browser Notifications Enabled"
              />
              <StepStatus
                step={steps.sitePermission}
                label="Site Permission Granted"
              />
              <StepStatus
                step={steps.backendSubscribed}
                label="Subscribed to Backend"
              />
            </List>
          </VStack>
        </AlertDescription>
      </Alert>
    </Box>
  );

  return (
    <ChakraProvider>
      {showInstructions && isAlertVisible && content}
    </ChakraProvider>
  );
};

export default NotificationSubscription;
