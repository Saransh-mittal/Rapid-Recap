import { useState, useEffect } from "react";
import { useNavigationType } from "react-router-dom";

export const useNavigationCount = () => {
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem("navigationCount");
    return saved ? parseInt(saved, 10) : 0;
  });
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "PUSH") {
      setCount((prevCount) => prevCount + 1);
    } else if (navigationType === "POP") {
      setCount((prevCount) => Math.max(0, prevCount - 1));
    }
  }, [navigationType, location.pathname]);

  useEffect(() => {
    localStorage.setItem("navigationCount", count.toString());
  }, [count]);

  const isLastRoute = count < 1;

  return { count, isLastRoute };
};
