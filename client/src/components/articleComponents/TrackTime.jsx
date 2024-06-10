import React, { useEffect, useState, useRef } from "react";
import { useToast } from "@chakra-ui/react";

const TrackTime = ({ userId, articleId }) => {
  const [startTime, setStartTime] = useState(Date.now());
  const totalTimeRef = useRef(0);
  const toast = useToast();

  useEffect(() => {
    const handleUnload = () => {
      const endTime = Date.now();
      const timeSpent = endTime - startTime;
      totalTimeRef.current += timeSpent;

      console.log("handleUnload called");
      console.log(
        `User ${userId} spent ${totalTimeRef.current} ms on article ${articleId}`
      );

      // Create the payload
      const payload = JSON.stringify({
        userId,
        articleId,
        timeSpent: totalTimeRef.current,
      });

      // Use navigator.sendBeacon to send the data to the backend
      navigator.sendBeacon("/api/track-time", payload);
    };

    const handleVisibilityChange = () => {
      console.log("handleVisibilityChange called", document.visibilityState);
      if (document.visibilityState === "hidden") {
        handleUnload();
      } else if (document.visibilityState === "visible") {
        setStartTime(Date.now());
        console.log("Page became visible, startTime set to", Date.now());
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      handleUnload();
    };
  }, [startTime, userId, articleId]);

  return null;
};

export default TrackTime;
