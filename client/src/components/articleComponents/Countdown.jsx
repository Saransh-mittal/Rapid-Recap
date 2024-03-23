import React, { useState, useEffect } from "react";
import "./Countdown.css";
import { Box, Heading, Text } from "@chakra-ui/react";

const Countdown = ({
  initialTimer,
  onTimerExhausted,
  submitted,
  start,
  setTimeTaken,
}) => {
  const [timer, setTimer] = useState(initialTimer);

  useEffect(() => {
    if (!start || submitted || timer === 0) return;

    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        const newTimer = prevTimer - 1;
        setTimeTaken((prevTimeTaken) => prevTimeTaken + 1);
        if (newTimer === 0) {
          clearInterval(intervalId);
          onTimerExhausted();
        }
        return newTimer;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timer, start, submitted, onTimerExhausted, setTimeTaken]);

  const dynamicStyles = {
    dotRotation: `rotate(${(360 * timer) / initialTimer}deg)`,
    loadingPercent: `${100 - (timer / initialTimer) * 100}%`,
    fontSize: timer > 9 ? "40px" : "30px",
    color: timer > 0 ? "#000000" : "#FF0000", // Change color when timer runs out
  };

  return (
    <>
      {timer && !submitted ? (
        <div
          className="container-timer"
          style={{ fontSize: dynamicStyles.fontSize }}
        >
          <div className="text-timer">{timer > 9 ? timer : `0${timer}`}</div>
          <div
            className="dot-timer"
            style={{ transform: dynamicStyles.dotRotation }}
          ></div>
          <svg>
            <circle cx="70" cy="70" r="70" />
            <circle
              strokeDashoffset={dynamicStyles.loadingPercent}
              cx="70"
              cy="70"
              r="70"
            />
          </svg>
        </div>
      ) : (
        <Box marginTop="20px">
          <Heading as="h6" fontSize="30px" color={dynamicStyles.color}>
            {timer > 0
              ? `Submitted in ${initialTimer - timer} Secs`
              : "!! Time's Up !!"}
          </Heading>
        </Box>
      )}
    </>
  );
};

export default Countdown;
