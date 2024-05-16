import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Box,
} from "@chakra-ui/react";
import styled, { keyframes } from "styled-components";

// Define the pulsating animation
const pulsate = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Apply the animation to the headings
const PulsatingText = styled(Text)`
  animation: ${pulsate} 2s infinite;
`;

const QuinBoostModal = ({
  isOpen,
  onClose,
  quizLeftToGetQuizBoost,
  isStateBoosted,
}) => {
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
        `}
      </style>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent
          style={{
            backgroundColor: "#0f0d15",
            color: "white",
            borderRadius: "10px",
          }}
        >
          <ModalHeader
            textAlign="center"
            p={0}
            bg="transparent"
            borderBottom="none"
          >
            <PulsatingText
              fontSize="4xl"
              fontFamily="fantasy"
              color="gold"
              letterSpacing="wide"
            >
              Quin <span style={{ color: "crimson" }}>Boost!</span>
            </PulsatingText>
            <Text fontSize="sm" color="gray.500" mt={"-3"} fontStyle="italic">
              Level up your skills!
            </Text>
          </ModalHeader>

          <ModalCloseButton />
          <ModalBody>
            {isStateBoosted ? (
              <Box mt={"1rem"}>
                <Text
                  fontSize={{ base: "xl", md: "lg" }}
                  color="purple.600"
                  textAlign="left"
                  mb="4"
                  fontFamily="Montserrat, sans-serif"
                  fontWeight="bold"
                  fontStyle="italic"
                  //textDecoration="underline"
                >
                  Quin Boost Inactive!
                </Text>
                <Text
                  fontSize={{ base: "md", md: "md" }}
                  color="cyan.400"
                  textAlign="left"
                  fontFamily="serif"
                  fontStyle="italic"
                  fontWeight="bold"
                >
                  {"➤"} Supercharge Your RQM Score! 6th Quiz RQM scores get a
                  1.5x boost!{" "}
                  <span role="img" aria-label="rocket">
                    🚀
                  </span>
                </Text>
                <Text
                  fontSize={{ base: "md", md: "md" }}
                  color="#C3FF93"
                  textAlign="left"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {"➤"} Keep Track of Your Progress! See the countdown image on
                  each quiz page to know how close you are!
                </Text>
              </Box>
            ) : (
              <Box>
                <Box mt={"1rem"}>
                  <Text
                    fontSize={{ base: "xl", md: "lg" }}
                    color="#874CCC"
                    textAlign="left"
                    mb="4"
                    fontFamily="Montserrat, sans-serif"
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        fontStyle: "italic",
                      }}
                    >
                      Quin Boost Active!
                    </span>{" "}
                    Enjoy the 1.5x RQM Score Boost!
                  </Text>
                  <Text
                    fontSize={{ base: "md", md: "md" }}
                    color="#CDEAD5"
                    textAlign="left"
                    style={{
                      fontStyle: "italic",
                      fontWeight: "bold",
                    }}
                  >
                    {"➤"} Keep Quizzing to Maintain Your Boost! Stay sharp to
                    keep the boost active!{" "}
                    <span role="img" aria-label="thumbs-up">
                      👍
                    </span>
                  </Text>
                </Box>
                <Text
                  fontSize={{ base: "md", md: "md" }}
                  color="#F5DAD2"
                  textAlign="left"
                  mt={"1rem"}
                  style={{
                    fontStyle: "italic",
                    fontWeight: "bold",
                  }}
                >
                  {"➤"} Once Quin Boost is activated, a special badge appears on
                  your next quiz, signaling its activation! 🏅
                </Text>

                <Text
                  fontSize={{ base: "sm", md: "sm" }}
                  color="gray.600"
                  textAlign="center"
                  mt={"2rem"}
                  style={{
                    fontStyle: "italic",
                    fontWeight: "bold",
                  }}
                >
                  Note: Quin Boost is exclusive to your sixth quiz. Enjoy the
                  1.5x RQM Score boost, but remember, it's a one-time offer!
                  Make it count! 🎉
                </Text>
              </Box>
            )}

            {/* Rest of your content */}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default QuinBoostModal;
