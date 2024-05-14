import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Flex,
  Image,
  Box,
} from "@chakra-ui/react";
import TextBackgound from "/images/textBackground.png";
import QuinBoost from "./quizComponents/QuinBoost";

const QuinBoostModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent
        style={{
          backgroundColor: "#0f0d15",
          color: "white",
          borderRadius: "10px",
        }}
      >
        <Box
          bgGradient="linear(to-r, #667eea, #764ba2)"
          borderRadius="xl"
          p="1"
          textAlign="center"
          boxShadow="xl"
        >
          <ModalHeader
            fontWeight="bold"
            fontSize={{ base: "3xl", md: "5xl" }}
            color="white"
            textShadow="2px 2px 4px rgba(0,0,0,0.4)"
            letterSpacing="wide"
            fontFamily="Montserrat, sans-serif"
            lineHeight="1.2"
            textDecoration="underline"
          >
            Quin Boost!
          </ModalHeader>
        </Box>

        <ModalCloseButton />
        <ModalBody>
          <Box mt={"1rem"}>
            <Text
              fontSize={{ base: "xl", md: "xl" }}
              // fontWeight="bold"
              color="gray.600"
              textAlign="center"
              mb="4"
            >
              <span
                style={{
                  fontWeight: "bold",
                  fontStyle: "italic",
                  textDecoration: "underline",
                }}
              >
                Quin Boost:
              </span>{" "}
              Unlocks after five quizzes.
            </Text>
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              color="gray.600"
              textAlign="center"
            >
              Your RQM Score on the sixth quiz gets a 1.5x supercharge!{" "}
              <span role="img" aria-label="rocket">
                🚀
              </span>
            </Text>
          </Box>
          {/* <Text>
            This means that you can earn up to 1500 points on your sixth quiz
            instead of the usual 1000. This is a great opportunity to boost your
            RQM Score and climb the leaderboard! 🏆
          </Text> */}
          <Text>
            Track your Quin Boost progress on every quiz page with a countdown
            image indicating quizzes left until boost!
          </Text>
          {/* <Flex> */}
          <Text
            m={0}
            p={0}
            textAlign={"left"}
            paddingLeft={"8rem"}
            position={"relative"}
            color={"#9CAFAA"}
            fontWeight={"bold"}
          >
            {" "}
            Quin Boost{" "}
          </Text>
          <Flex
            marginTop={"-15px"}
            position={"relative"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Image
              src={TextBackgound}
              background={"none"}
              height={"100px"}
              width={"200px"}
            />
            <Text
              m={0}
              p={0}
              textAlign={"left"}
              position={"absolute"}
              color={"black"}
              fontSize={"20px"}
              fontWeight={"bold"}
            >
              {" "}
              {5} Quiz Left{" "}
            </Text>
          </Flex>
          {/* </Flex> */}

          <Text>
            Once Quin Boost is activated, a special badge appears on your next
            quiz, signaling its activation! 🏅
          </Text>
          <Flex justifyContent={"center"} alignItems="center">
            <Flex
              justifyContent={"center"}
              alignItems={"center"}
              position={"relative"}
              // backgroundColor={"red"}
              marginBottom={"10px"}
              w={"50%"}
            >
              <QuinBoost />
            </Flex>
          </Flex>

          <Text>
            Quin Boost is exclusive to your sixth quiz. Enjoy the 1.5x RQM Score
            boost, but remember, it's a one-time offer! Make it count! 🎉
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QuinBoostModal;
