import { Box, Flex } from "@chakra-ui/react";
import React from "react";

const Bubbles = () => {
  const keyframes = `
    @keyframes shine {
      0% {
        box-shadow: 0 0 10px 0 rgba(255, 255, 0, 0.5);
      }
      50% {
        box-shadow: 0 0 10px 0 rgba(255, 255, 0, 0);
      }
      100% {
        box-shadow: 0 0 10px 0 rgba(255, 255, 0, 0.5);
      }
    }

    @keyframes bubbleTop {
      0% {
        transform: translateY(-35px) scale(1); /* Start from bottom */
        opacity: 1;
      }
      100% {
        transform: translateY(-55px) scale(0.6); /* End at top */
        opacity: 0;
      }
    }

    @keyframes bubbleBottom {
      0% {
        transform: translateY(25px) scale(1); /* Start from button position */
        opacity: 1;
      }
      100% {
        transform: translateY(45px) scale(0.6); /* Move further up and to the right */
        opacity: 0;
      }
    }

    @keyframes bubbleLeft {
      0% {
        transform: translateX(-95px) scale(1); /* Start from button position */
        opacity: 1;
      }
      100% {
        transform: translateX(-105px) scale(0.6); /* Move further up and to the right */
        opacity: 0;
      }
    }

    @keyframes bubbleRight {
      0% {
        transform: translateX(95px) scale(1); /* Start from button position */
        opacity: 1;
      }
      100% {
        transform: translateX(105px) scale(1); /* Move further up and to the right */
        opacity: 0;
      }
    }
  `;
  const BubbleStyle = {
    position: "absolute",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  };
  return (
    <Flex css={keyframes}>
      {Array.from({ length: 10 }).map((_, index) => (
        <Box
          position={"absolute"}
          key={index}
          style={{
            ...BubbleStyle,
            top: `${Math.random() * 100}%`, // Randomize bubble position
            left: `${Math.random() * 100}%`, // Randomize bubble position
            animationDelay: `${Math.random() * 3}s`, // Randomize animation delay
            background: `hsla(${Math.random() * 360}, 100%, 50%, ${
              Math.random() * 0.5
            })`, // Randomize color with alpha channel
          }}
          animation="bubbleTop 3s infinite"
        />
      ))}
      {Array.from({ length: 10 }).map((_, index) => (
        <Box
          position={"absolute"}
          key={index}
          style={{
            ...BubbleStyle,
            top: `${Math.random() * 100}%`, // Randomize bubble position
            left: `${Math.random() * 100}%`, // Randomize bubble position
            animationDelay: `${Math.random() * 3}s`, // Randomize animation delay
            background: `hsla(${Math.random() * 360}, 100%, 50%, ${
              Math.random() * 0.5
            })`, // Randomize color with alpha channel
          }}
          animation="bubbleBottom 3s infinite" // Apply bubble animation
        />
      ))}
      {Array.from({ length: 10 }).map((_, index) => (
        <Box
          position={"absolute"}
          key={index}
          style={{
            ...BubbleStyle,
            top: `${Math.random() * 100}%`, // Randomize bubble position
            left: `${Math.random() * 100}%`, // Randomize bubble position
            animationDelay: `${Math.random() * 3}s`, // Randomize animation delay
            background: `hsla(${Math.random() * 360}, 100%, 50%, ${
              Math.random() * 0.5
            })`, // Randomize color with alpha channel
          }}
          animation="bubbleLeft 3s infinite"
        />
      ))}
      {Array.from({ length: 10 }).map((_, index) => (
        <Box
          position={"absolute"}
          key={index}
          style={{
            ...BubbleStyle,
            top: `${Math.random() * 100}%`, // Randomize bubble position
            left: `${Math.random() * 100}%`, // Randomize bubble position
            animationDelay: `${Math.random() * 3}s`, // Randomize animation delay
            background: `hsla(${Math.random() * 360}, 100%, 50%, ${
              Math.random() * 0.5
            })`, // Randomize color with alpha channel
          }}
          animation="bubbleRight 3s infinite"
        />
      ))}
    </Flex>
  );
};

export default Bubbles;
