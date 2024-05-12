import { Box, Button, Text } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { AppContext } from "../../contextAPI/appContext";
import Bubbles from "../miscellaneous/bubbles";

const GenerateQuizButton = ({ onClick, css }) => {
  const { state } = useContext(AppContext);
  const isBoosted = state.isBoosted;
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
  `;
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
        {isBoosted && <Bubbles />}
        Generate Quiz
      </Button>
    </Box>
  );
};

export default GenerateQuizButton;
