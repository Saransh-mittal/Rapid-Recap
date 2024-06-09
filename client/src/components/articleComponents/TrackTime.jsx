import React, { useEffect, useRef } from "react";
import axios from "axios";

const TrackTime = ({ userId, articleId }) => {
  const startTimeRef = useRef(null);
  const totalTimeRef = useRef(0);
  let tt = 0;

  useEffect(() => {
    console.log("TrackTime component mounted");
    const startTracking = () => {
      startTimeRef.current = Date.now();
    };

    const stopTracking = (event) => {
      const endTime = Date.now();
      const timeSpent = endTime - startTimeRef.current;
      totalTimeRef.current += timeSpent;
      console.log("Time spent on this page:", totalTimeRef.current);
      tt = totalTimeRef.current;

      if (event && event.type === "beforeunload") {
        console.log("Sending time spent data beforeunload event");
        // Use synchronous XHR for beforeunload event
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/timeSpent", false);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(
          JSON.stringify({
            userId,
            articleId,
            timeSpent: totalTimeRef.current,
          })
        );
        totalTimeRef.current = 0;
      } else {
        // axios
        //   .post("/api/timeSpent", {
        //     userId,
        //     articleId,
        //     timeSpent: totalTimeRef.current,
        //   })
        //   .then(() => {
        //     totalTimeRef.current = 0;
        //   })
        //   .catch((error) => {
        //     console.error("Error sending time spent data:", error);
        //   });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopTracking();
      } else {
        startTracking();
      }
    };

    const handlePopState = () => {
      stopTracking();
      startTracking();
    };

    const handleBeforeUnload = (event) => {
      stopTracking(event);
    };

    startTracking();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      stopTracking();
      //   console.log(tt);
      //   console.log("TrackTime component unmounted");
    };
  }, [userId, articleId]);

  return null;
};

export default TrackTime;
