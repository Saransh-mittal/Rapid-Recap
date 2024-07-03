// /components/Countdown.jsx
import React from "react";
import "./Countdown.css";
import { Box, Heading } from "@chakra-ui/react";

const Countdown = ({ timer, submitted }) => {
  const initialTimer = 50; // Initial timer value
  const dynamicStyles = {
    dotRotation: `rotate(${(360 * timer) / initialTimer}deg)`,
    loadingPercent: `${100 - (timer / initialTimer) * 100}%`,
    fontSize: timer > 9 ? "40px" : "30px",
    color: timer > 0 ? "#FFF" : "#FF0000", // Change color when timer runs out
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
