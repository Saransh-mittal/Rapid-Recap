// import React, { useEffect, useState } from "react";

// const TrackTime = ({ userId, articleId }) => {
//   const [startTime, setStartTime] = useState(Date.now());

//   useEffect(() => {
//     const handleUnload = () => {
//       const endTime = Date.now();
//       const timeSpent = endTime - startTime;

//       // console.log("handleUnload called");
//       // console.log(
//       //   `User ${userId} spent ${totalTimeRef.current} ms on article ${articleId}`
//       // );

//       // Create the payload
//       const payload = JSON.stringify({
//         userId,
//         articleId,
//         timeSpent,
//       });
//       //console.log("Payload:", payload);
//       // Use navigator.sendBeacon to send the data to the backend
//       navigator.sendBeacon("/api/timeSpent", payload);
//     };

//     const handleVisibilityChange = () => {
//       //console.log("handleVisibilityChange called", document.visibilityState);
//       if (document.visibilityState === "hidden") {
//         handleUnload();
//       } else if (document.visibilityState === "visible") {
//         setStartTime(Date.now());
//         //console.log("Page became visible, startTime set to", Date.now());
//       }
//     };

//     //window.addEventListener("beforeunload", handleUnload);
//     document.addEventListener("visibilitychange", handleVisibilityChange);

//     // Cleanup function
//     return () => {
//       //window.removeEventListener("beforeunload", handleUnload);
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//       handleUnload();
//     };
//   }, [startTime, userId, articleId]);

//   return null;
// };

// export default TrackTime;

import React, { useEffect, useState, useRef } from "react";

const TrackTime = ({ userId, articleId }) => {
  const [startTime, setStartTime] = useState(Date.now());
  const activityTimeout = useRef(null);

  const handleUnload = () => {
    const endTime = Date.now();
    const timeSpent = endTime - startTime;

    const payload = JSON.stringify({
      userId,
      articleId,
      timeSpent,
    });

    navigator.sendBeacon("/api/timeSpent", payload);
  };

  const determineTimeoutPeriod = () => {
    if (window.innerWidth >= 1024) {
      return 4 * 60 * 1000; // 4 minutes for large screens
    } else if (window.innerWidth >= 768) {
      return 2 * 60 * 1000; // 2 minutes for medium screens
    } else {
      return 1 * 60 * 1000; // 1 minute for base screens
    }
  };

  const resetTimeout = () => {
    clearTimeout(activityTimeout.current);
    const timeoutPeriod = determineTimeoutPeriod();
    activityTimeout.current = setTimeout(() => {
      handleUnload();
      setStartTime(Date.now()); // Reset the start time
    }, timeoutPeriod);
  };

  useEffect(() => {
    const handleUserActivity = () => {
      resetTimeout();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleUnload();
      } else if (document.visibilityState === "visible") {
        setStartTime(Date.now());
        resetTimeout();
      }
    };

    window.addEventListener("scroll", handleUserActivity);
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("touchmove", handleUserActivity);
    window.addEventListener("keypress", handleUserActivity);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    resetTimeout(); // Initialize the inactivity timeout

    return () => {
      clearTimeout(activityTimeout.current);
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("touchmove", handleUserActivity);
      window.removeEventListener("keypress", handleUserActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      handleUnload();
    };
  }, [startTime, userId, articleId]);

  return null;
};

export default TrackTime;
