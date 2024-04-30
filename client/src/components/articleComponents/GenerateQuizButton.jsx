import { Box, Button, Text } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { AppContext } from "../../contextAPI/appContext";

const GenerateQuizButton = ({ onClick, css }) => {
  const { state } = useContext(AppContext);
  const isBoosted = state.streak > 0 && state.streak % 7 === 0;
  const buttonStyle = {
    height: "35px",
    width: "110px",
    borderRadius: "xl",
    color: "#37306B",
    backgroundColor: "#F7EFE5",
    border: isBoosted ? "yellow solid 3px" : "none",
    transition: isBoosted ? "box-shadow 2s ease-in-out" : "none",
    animation: isBoosted ? "shine 1s infinite alternate" : "none", // Use CSS animation for shining effect
    _hover: { opacity: 0.3 },
  };
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
  const bubbleStyle = {
    position: "absolute",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  };
  return (
    <Box
      css={[css, keyframes]}
      style={{
        border: "2px",
        padding: "1rem",
        position: "relative", // Set position relative for containing bubbles
      }}
      borderRadius="xl"
      backgroundColor="#2A2F4F"
      marginBottom="1rem"
      className="generate-quiz-button"
    >
      <Text
        fontSize="18px"
        fontWeight="bold"
        marginBottom="1rem"
        letterSpacing={0.25}
        color="#FDE2F3" // Change the color here
      >
        !!! Compete in the quiz for a chance at the LeaderBoard !!!
      </Text>
      <Button onClick={onClick} style={buttonStyle} position={"relative"}>
        {/* Generate bubbles */}
        {isBoosted &&
          Array.from({ length: 10 }).map((_, index) => (
            <Box
              position={"absolute"}
              key={index}
              style={{
                ...bubbleStyle,
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
        {isBoosted &&
          Array.from({ length: 10 }).map((_, index) => (
            <Box
              position={"absolute"}
              key={index}
              style={{
                ...bubbleStyle,
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
        {isBoosted &&
          Array.from({ length: 10 }).map((_, index) => (
            <Box
              position={"absolute"}
              key={index}
              style={{
                ...bubbleStyle,
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
        {isBoosted &&
          Array.from({ length: 10 }).map((_, index) => (
            <Box
              position={"absolute"}
              key={index}
              style={{
                ...bubbleStyle,
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
        Generate Quiz
      </Button>
    </Box>
  );
};

export default GenerateQuizButton;
