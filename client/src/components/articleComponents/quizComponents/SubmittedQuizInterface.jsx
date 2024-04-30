import React from "react";
import { Text, SlideFade, Heading, Image, Flex } from "@chakra-ui/react";
import rocket from "/images/rocket.png";

const SubmittedQuizInterface = ({ score, isOpen }) => {
  const rocketStyle = {
    position: "relative",

    bottom: "-500%",
    animation: "animate-rocket 2s ease forwards, animate 0.2s ease infinite",
  };

  const keyframes = `
    @keyframes animate-rocket {
      0% {
        bottom: -500%;
      }
      100% {
        bottom: 15%;
      }
    }
    @keyframes animate {
      0%, 100% {
        transform: translateY(-2px);
      }
      50% {
        transform: translateY(2px);
      }
    }`;
  return (
    <SlideFade
      direction="bottom"
      in={isOpen}
      offsetY="20px"
      style={{ zIndex: 10 }}
    >
      <Flex
        justifyContent={"center"}
        alignItems={"center"}
        width={"120px"}
        h={"120px"}
        borderRadius={"50%"}
        backgroundColor={"transparent"}
        position={"absolute"}
        top="5%"
        left="43%"
      >
        <Flex
          style={rocketStyle}
          css={keyframes}
          _before={{
            content: `""`,
            position: "absolute",
            left: "50%",
            bottom: "-50px",
            transform: "translateX(-50%)",
            width: "10px",
            height: "50px",
            background: "linear-gradient(#00d0ff,transparent)",
          }}
          _after={{
            content: `""`,
            position: "absolute",
            left: "50%",
            bottom: "-50px",
            transform: "translateX(-50%)",
            width: "10px",
            height: "50px",
            background: "linear-gradient(#00d0ff,transparent)",
            filter: "blur(20px)",
          }}
        >
          <Image src={rocket} h={"50px"} w={"35px"} background={"none"} />
        </Flex>
      </Flex>
      <Heading
        as="h3"
        size="lg"
        color="#3E3232"
        position="absolute"
        top="40%"
        width="100%"
        left="50%"
        transform="translateX(-50%)"
        textAlign="center"
      >
        Quiz completed. Thank you for participating!
      </Heading>
      <Text color="#503C3C" fontSize="30px" textAlign="center" marginTop="10">
        RQM_score: {`${score}`}
      </Text>
    </SlideFade>
  );
};

export default SubmittedQuizInterface;
