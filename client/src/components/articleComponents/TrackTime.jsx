import React, { useEffect, useState, useRef } from "react";

const TrackTime = ({ userId, articleId }) => {
  const [startTime, setStartTime] = useState(Date.now());
  const [isTracking, setIsTracking] = useState(true);
  const timeoutRef = useRef(null);

  const getInactiveTime = () => {
    if (window.innerWidth >= 1024) return 3 * 60 * 1000; // 3 mins for large screens
    if (window.innerWidth >= 768) return 2 * 60 * 1000; // 2 mins for medium screens
    return 60 * 1000; // 1 min for base screens
  };

  const handleUnload = () => {
    const endTime = Date.now();
    const timeSpent = endTime - startTime;

    // console.log(`User ${userId} spent ${timeSpent} ms on article ${articleId}`);

    const payload = JSON.stringify({
      userId,
      articleId,
      timeSpent,
    });

    navigator.sendBeacon("/api/timeSpent", payload);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      handleUnload();
      setIsTracking(false);
    } else if (document.visibilityState === "visible") {
      setStartTime(Date.now());
      setIsTracking(true);
      resetTimer();
    }
  };

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isTracking) {
      timeoutRef.current = setTimeout(() => {
        handleUnload();
        setIsTracking(false);
      }, getInactiveTime());
    }
  };

  const handleUserActivity = () => {
    if (!isTracking) {
      setStartTime(Date.now());
      setIsTracking(true);
    }
    resetTimer();
  };

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "touchmove",
      "scroll",
    ];

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      handleUnload();
    };
  }, [userId, articleId]);

  useEffect(() => {
    if (isTracking) {
      resetTimer();
    }
  }, [isTracking]);

  return null;
};

export default TrackTime;
