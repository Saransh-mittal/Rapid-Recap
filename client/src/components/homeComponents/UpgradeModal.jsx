import React, { useContext, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Flex,
  Image,
  Text,
  Box,
} from "@chakra-ui/react";
import { AppContext } from "./../../contextAPI/appContext";
import CircleAndSocietyData from "../../assets/CircleAndSocietyData";
import { motion } from "framer-motion";
import Lightning from "../profileComponents/RankAndSocietySubCompnents/Lightning";
import CircleLightning from "./CircleLighting/CircleLighting";
import axios from "axios";
import "./BlinkingButton.css";
import Arrow from "/images/arrow.webp";
import Circle from "/images/circle.webp";
// const AnimatedText = motion(Text);

const UpgradeModal = ({ isOpen, onClose }) => {
  const { state, dispatch } = useContext(AppContext);

  const USER_IQ = state.user.IQ_score;
  // console.log(USER_IQ);
  // const USER_IQ = 111;
  const findSocietyAndCircle = (USER_IQ) => {
    let SocietyOrCircle = null;
    // Iterate through CircleAndSocietyData to find the appropriate entry
    CircleAndSocietyData.forEach((entry) => {
      // Check if USER_IQ falls within the IQ range of the entry
      if (
        USER_IQ >= entry.IQ_Lower &&
        (entry.IQ_Upper === null || USER_IQ < entry.IQ_Upper)
      ) {
        SocietyOrCircle = entry;
      }
    });

    return SocietyOrCircle;
  };

  // Determine the society and circle for the current USER_IQ
  const upgradedSocietyOrCircle = findSocietyAndCircle(USER_IQ);
  // console.log(upgradedSocietyOrCircle);
  const prevSocietyOrCircle = findSocietyAndCircle(state.user.prevIQScore);
  // console.log(prevSocietyOrCircle);

  const isCircleUpdgraded =
    upgradedSocietyOrCircle.society === prevSocietyOrCircle.society;

  const handleUpgradeMessageClose = async () => {
    try {
      await axios.put("/api/user/upgradeMessageClose");
      dispatch({
        type: "setUser",
        payloadUser: { ...state.user, societyUpgradeMessage: "" },
      });
      onClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // useEffect(() => {
  //   if (USER_IQ <= state.prevIQScore) {
  //     handleUpgradeMessageClose();
  //   } else if (
  //     prevSocietyOrCircle.society === upgradedSocietyOrCircle.society &&
  //     prevSocietyOrCircle.circle === upgradedSocietyOrCircle.circle
  //   ) {
  //     handleUpgradeMessageClose();
  //   }
  // }, []);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }}>
      <ModalOverlay />
      <ModalContent
        backgroundImage="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
        boxShadow="0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
        color="white"
      >
        <Box textAlign="center">
          <ModalHeader fontSize="3xl" fontWeight="bold">
            <span
              style={{
                background: "-webkit-linear-gradient(45deg, #ff9a9e, #fecfef)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0px 0px 8px rgba(255, 255, 255, 0.8)",
              }}
            >
              Congratulations, {state.user.name}!
            </span>
          </ModalHeader>
        </Box>
        <ModalBody overflow="hidden">
          {!isCircleUpdgraded ? (
            <>
              <Flex align="center" justify="center" mt={4}>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="purple.600"
                  letterSpacing="wide"
                  textTransform="uppercase"
                  fontStyle="italic"
                  fontFamily="sans-serif"
                >
                  Society Upgrade
                </Text>
              </Flex>
              <Flex align="center" justify="center" mt={4}>
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  w="100%"
                  position="relative"
                  flexDirection="row"
                >
                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    w="100%"
                    position="relative"
                    flexDirection="column"
                    mt={1.5}
                  >
                    <Flex
                      justifyContent="center"
                      alignItems="center"
                      w="100%"
                      position="relative"
                      flexDirection="column"
                      mb={3}
                    >
                      <Image
                        src={prevSocietyOrCircle.image}
                        alt="Brain"
                        style={{
                          width: "80px",
                          height: "80px",
                          background: "transparent",
                        }}
                      />
                      {/* <Lightning /> */}
                    </Flex>
                    <Text
                      textAlign="center"
                      fontSize="md"
                      fontWeight="bold"
                      color={prevSocietyOrCircle.textColor}
                      textShadow="2px 2px 4px rgba(0,0,0,0.4)"
                      paddingLeft={{ base: "5.5%", md: "9.5%", xl: "0.5%" }}
                    >
                      {/* {prevSocietyOrCircle.society} */}
                      {prevSocietyOrCircle?.society?.split(" ")[0]}
                      <span> Society</span>
                    </Text>
                  </Flex>
                  <Flex
                    w={"100%"}
                    mt={"-5rem"}
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <Image
                      src={Arrow}
                      alt="Arrow"
                      boxSize="50px"
                      background={"transparent"}
                      // mx={4}
                    />
                  </Flex>

                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    w="100%"
                    position="relative"
                    flexDirection="column"
                    // mt={9}
                    // mt={-4}
                  >
                    <Flex
                      justifyContent="center"
                      alignItems="center"
                      w="100%"
                      position="relative"
                      flexDirection="column"
                      mb={3}
                    >
                      <motion.img
                        src={upgradedSocietyOrCircle.image}
                        alt="Brain"
                        style={{
                          width: "80px",
                          height: "80px",
                          background: "transparent",
                        }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      />
                      <Lightning />
                    </Flex>
                    <Text
                      textAlign="center"
                      fontSize="md"
                      fontWeight="bold"
                      color={upgradedSocietyOrCircle.textColor}
                      textShadow="2px 2px 4px rgba(0,0,0,0.4)"
                      paddingLeft={{ base: "5.5%", md: "9.5%", xl: "0.5%" }}
                    >
                      {upgradedSocietyOrCircle.society.split(" ")[0]}
                      <p>Society</p>
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </>
          ) : (
            <>
              <Flex align="center" justify="center" mt={4}>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color="purple.600"
                  letterSpacing="wide"
                  textTransform="uppercase"
                  fontStyle="italic"
                  fontFamily="sans-serif"
                >
                  Circle Upgrade
                </Text>
              </Flex>
              <Flex align="center" justify="center" mt={4}>
                <Flex align="center" justify="center" mt={4}>
                  <Flex
                    flexDirection={"column"}
                    align="center"
                    justify="center"
                    position={"relative"}
                    mt={-7}
                  >
                    <motion.img
                      src={Circle}
                      alt="Circle"
                      style={{
                        width: "150px",
                        height: "150px",
                        background: "transparent",
                      }}
                    />
                    <CircleLightning />
                    <Flex
                      flexDirection="column"
                      align="center"
                      justify="center"
                      position="absolute"
                      top="54%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                    >
                      <Text
                        align="center"
                        justify="center"
                        // mt={-4}
                        color={upgradedSocietyOrCircle.textColor}
                        textShadow="0px 2px 4px rgba(0, 0, 0, 0.5)"
                        fontSize="md"
                        fontWeight="bold"
                        letterSpacing="wide"
                        fontFamily="heading"
                      >
                        {upgradedSocietyOrCircle?.circle?.split(" ")[0]}
                      </Text>
                      <Text
                        align="center"
                        justify="center"
                        mt={-4}
                        color={upgradedSocietyOrCircle.textColor}
                        textShadow="0px 2px 4px rgba(0, 0, 0, 0.5)"
                        fontSize="md"
                        fontWeight="bold"
                        letterSpacing="wide"
                        fontFamily="heading"
                      >
                        {upgradedSocietyOrCircle?.circle?.split(" ")[1]}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </>
          )}

          <Text
            // mt={4}
            fontSize="md"
            color="#ffcab0"
            lineHeight="1.6"
            textAlign="center"
            // fontStyle="italic"
          >
            {state.user.societyUpgradeMessage}
          </Text>
          <Text
            // mt={4}
            m={0}
            fontSize="13px"
            color="gray.500"
            textAlign="center"
            fontStyle="italic"
          >
            Your journey to mastery continues...
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            // mr={3}
            mt={-3}
            onClick={handleUpgradeMessageClose}
            bgGradient="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
            boxShadow="0px 0px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
            color="#9896f1"
            transition="all 0.3s ease-in-out"
            animation="slowBlinking 3s infinite alternate ease-in-out"
          >
            Continue Your Journey..
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpgradeModal;
