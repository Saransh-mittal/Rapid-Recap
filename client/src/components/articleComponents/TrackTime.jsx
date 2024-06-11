import React, { useEffect, useState } from "react";

const TrackTime = ({ userId, articleId }) => {
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    const handleUnload = () => {
      const endTime = Date.now();
      const timeSpent = endTime - startTime;

      // console.log("handleUnload called");
      // console.log(
      //   `User ${userId} spent ${totalTimeRef.current} ms on article ${articleId}`
      // );

      // Create the payload
      const payload = JSON.stringify({
        userId,
        articleId,
        timeSpent,
      });
      //console.log("Payload:", payload);
      // Use navigator.sendBeacon to send the data to the backend
      navigator.sendBeacon("/api/timeSpent", payload);
    };

    const handleVisibilityChange = () => {
      //console.log("handleVisibilityChange called", document.visibilityState);
      if (document.visibilityState === "hidden") {
        handleUnload();
      } else if (document.visibilityState === "visible") {
        setStartTime(Date.now());
        //console.log("Page became visible, startTime set to", Date.now());
      }
    };

    //window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function
    return () => {
      //window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      handleUnload();
    };
  }, [startTime, userId, articleId]);

  return null;
};

export default TrackTime;
