import React, { useContext, useEffect } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  Image,
  Box,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { AppContext } from "../../contextAPI/appContext";

const DailyStreakModal = ({ setShowDailyStreakModal, getBackgroundColor }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { state } = useContext(AppContext);

  useEffect(() => {
    onOpen();
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Modal
            isOpen={isOpen}
            onClose={() => {
              onClose();
              setShowDailyStreakModal(false);
            }}
            size={"4xl"}
          >
            <ModalOverlay />
            <ModalContent
              initial={{ y: "-100vh" }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 150 }}
              background="linear-gradient(-45deg, #092635, #9EC8B9, #1B4242, #9EC8B9)"
              borderRadius="10px"
            >
              <ModalHeader
                as="h3"
                size="lg"
                color="white"
                textAlign="center"
                fontWeight="bold"
                borderBottom="1px solid rgba(255,255,255,0.1)"
                pb={2}
                mb={4}
              >
                Your Streak Insights
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody
                pb={4}
                display={"flex"}
                gap={4}
                flexDirection={"column"}
                p={1}
              >
                {state.streak === 0 && state.longestStreak === 0 && (
                  <>
                    <Text
                      color="white"
                      fontSize="20px"
                      textAlign="center"
                      fontWeight="medium"
                      mb={4}
                    >
                      Welcome aboard! Let's embark on this streak journey
                      together!
                    </Text>
                    <Text
                      color="white"
                      fontSize="16px"
                      textAlign="center"
                      lineHeight="1.5"
                    >
                      Starting your streak today means unlocking daily rewards
                      and achievements!
                    </Text>
                  </>
                )}
                {state.streak === 0 && state.longestStreak > 0 && (
                  <>
                    <Text
                      color="white"
                      fontSize="20px"
                      textAlign="center"
                      fontWeight="medium"
                      mb={4}
                    >
                      You've got this! Let's get back on track and aim for a new
                      streak record!
                    </Text>
                  </>
                )}
                {state.streak > 0 &&
                  state.streak >= 4 &&
                  state.streak % 7 < 5 &&
                  state.streak % 7 !== 0 &&
                  state.longestStreak === state.streak && (
                    <>
                      <Text
                        color="white"
                        fontSize="20px"
                        textAlign="center"
                        fontWeight="medium"
                        mb={4}
                      >
                        Congratulations on maintaining your streak! You're on
                        fire!
                      </Text>
                    </>
                  )}
                {state.streak > 0 &&
                  state.streak % 7 < 5 &&
                  state.streak % 7 !== 0 &&
                  state.longestStreak > state.streak && (
                    <>
                      <Text
                        color="white"
                        fontSize="20px"
                        textAlign="center"
                        fontWeight="medium"
                        mb={4}
                      >
                        Keep pushing forward! You're getting closer to your
                        longest streak! You've got this!
                      </Text>
                    </>
                  )}
                {state.streak > 0 && state.streak % 7 >= 5 && (
                  <>
                    <Text
                      color="white"
                      fontSize="20px"
                      textAlign="center"
                      fontWeight="medium"
                      mb={4}
                    >
                      You're about to hit a milestone! Get ready for an epic
                      reward!
                    </Text>
                  </>
                )}
                {state.streak > 0 && state.streak % 7 === 0 && (
                  <>
                    <Text
                      color="white"
                      fontSize="20px"
                      textAlign="center"
                      fontWeight="medium"
                      mb={4}
                    >
                      Today is your special reward day, where your dedication
                      pays off!
                    </Text>
                  </>
                )}
                {state.longestStreak > 0 && (
                  <>
                    <Text
                      color="white"
                      fontSize="20px"
                      textAlign="center"
                      fontWeight="medium"
                      mb={4}
                    >
                      You've maintained a streak for{" "}
                      <Text
                        as="span"
                        color="green.300"
                        backgroundColor="rgba(255,255,255,0.1)"
                        borderRadius="md"
                        px={2}
                        fontWeight="semibold"
                        textShadow="1px 1px 2px rgba(0, 0, 0, 0.4)"
                      >
                        {state.streak} days{" "}
                        <Box
                          as="svg"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox={
                            state.streak === 0 ? "0 0 18 18" : "0 0 24 24"
                          }
                          width={{ base: "1rem", lg: "1.3em" }}
                          height={{ base: "1rem", lg: "1.3em" }}
                          fill="currentColor"
                          display={"inline-flex"}
                          justifyContent={"center"}
                          alignItems={"center"}
                          zIndex={"1000"}
                          borderRadius={"50%"}
                          style={{
                            boxShadow:
                              state.streak % 7 === 0 && state.streak > 0
                                ? "0 0 10px 0 rgba(0, 150, 255, 0.7), 0 4px 8px 0 rgba(0, 150, 255, 0.3), 0 8px 20px 0 rgba(0, 150, 255, 0.2)"
                                : "none",
                          }}
                          marginBottom={"5px"}
                        >
                          {state.streak > 0 ? (
                            <>
                              <g filter="url(#hot-filled_svg__filter0_i_289_12318)">
                                <path
                                  fillRule="evenodd"
                                  d="M9.588 2.085a1 1 0 01.97.092c2.85 1.966 4.498 4.744 5.31 6.67l.854-.885a1 1 0 011.56.154c2.177 3.38 2.211 7.383.521 10.3C17.039 21.459 13.583 22 11.977 22c-1.569 0-4.905-.27-6.825-3.584-.832-1.435-1.27-3.053-1.125-4.704.146-1.66.876-3.284 2.264-4.721.86-.891 1.505-2.122 1.957-3.322.449-1.193.68-2.278.752-2.806a1 1 0 01.588-.778z"
                                  clipRule="evenodd"
                                  fill={getBackgroundColor({
                                    heatLevel: state.streak / 7,
                                  })}
                                ></path>
                              </g>
                              <defs>
                                <linearGradient
                                  id="hot-filled_svg__paint0_linear_289_12318"
                                  x1="12"
                                  x2="12"
                                  y1="2"
                                  y2="22"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FFA116"></stop>
                                  <stop offset="1" stopColor="#F9772E"></stop>
                                </linearGradient>
                                <filter
                                  id="hot-filled_svg__filter0_i_289_12318"
                                  width="17.2"
                                  height="21.2"
                                  x="4"
                                  y="2"
                                  colorInterpolationFilters="sRGB"
                                  filterUnits="userSpaceOnUse"
                                >
                                  <feFlood
                                    floodOpacity="0"
                                    result="BackgroundImageFix"
                                  ></feFlood>
                                  <feBlend
                                    in="SourceGraphic"
                                    in2="BackgroundImageFix"
                                    result="shape"
                                  ></feBlend>
                                  <feColorMatrix
                                    in="SourceAlpha"
                                    result="hardAlpha"
                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                  ></feColorMatrix>
                                  <feOffset dx="1.2" dy="1.2"></feOffset>
                                  <feGaussianBlur stdDeviation="0.6"></feGaussianBlur>
                                  <feComposite
                                    in2="hardAlpha"
                                    k2="-1"
                                    k3="1"
                                    operator="arithmetic"
                                  ></feComposite>
                                  <feColorMatrix values="0 0 0 0 0.970833 0 0 0 0 0.05825 0 0 0 0 0 0 0 0 0.16 0"></feColorMatrix>
                                  <feBlend
                                    in2="shape"
                                    result="effect1_innerShadow_289_12318"
                                  ></feBlend>
                                </filter>
                              </defs>
                            </>
                          ) : (
                            <>
                              <path
                                fill="white" // Set the fill color to red
                                fillRule="evenodd"
                                d="M7.19 1.564a.75.75 0 01.729.069c2.137 1.475 3.373 3.558 3.981 5.002l.641-.663a.75.75 0 011.17.115c1.633 2.536 1.659 5.537.391 7.725-1.322 2.282-3.915 2.688-5.119 2.688-1.177 0-3.679-.203-5.12-2.688-.623-1.076-.951-2.29-.842-3.528.109-1.245.656-2.463 1.697-3.54.646-.67 1.129-1.592 1.468-2.492.337-.895.51-1.709.564-2.105a.75.75 0 01.44-.583zm.784 2.023c-.1.368-.226.773-.385 1.193-.375.997-.947 2.13-1.792 3.005-.821.851-1.205 1.754-1.282 2.63-.078.884.153 1.792.647 2.645C6.176 14.81 7.925 15 8.983 15c1.03 0 2.909-.366 3.822-1.94.839-1.449.97-3.446.11-5.315l-.785.812a.75.75 0 01-1.268-.345c-.192-.794-1.04-2.948-2.888-4.625z"
                                clipRule="evenodd"
                              ></path>
                            </>
                          )}
                        </Box>
                      </Text>{" "}
                      Keep it up!
                    </Text>
                    <Text
                      color="white"
                      fontSize="24px"
                      textAlign="center"
                      fontWeight="medium"
                      mb={6}
                    >
                      Your longest streak is{" "}
                      <Text
                        as="span"
                        color="green.300"
                        backgroundColor="rgba(255,255,255,0.1)"
                        borderRadius="md"
                        px={2}
                        fontWeight="semibold"
                        textShadow="1px 1px 2px rgba(0, 0, 0, 0.4)"
                      >
                        {state.longestStreak} days{" "}
                        <Box
                          as="svg"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox={
                            state.longestStreak === 0
                              ? "0 0 18 18"
                              : "0 0 24 24"
                          }
                          width={{ base: "1.2rem", lg: "1.2em" }}
                          height={{ base: "1.2rem", lg: "1.2em" }}
                          fill="currentColor"
                          display={"inline-flex"}
                          justifyContent={"center"}
                          alignItems={"center"}
                          zIndex={"1000"}
                          borderRadius={"50%"}
                          marginBottom={"5px"}
                        >
                          {state.longestStreak > 0 ? (
                            <>
                              <g filter="url(#hot-filled_svg__filter0_i_289_12318)">
                                <path
                                  fillRule="evenodd"
                                  d="M9.588 2.085a1 1 0 01.97.092c2.85 1.966 4.498 4.744 5.31 6.67l.854-.885a1 1 0 011.56.154c2.177 3.38 2.211 7.383.521 10.3C17.039 21.459 13.583 22 11.977 22c-1.569 0-4.905-.27-6.825-3.584-.832-1.435-1.27-3.053-1.125-4.704.146-1.66.876-3.284 2.264-4.721.86-.891 1.505-2.122 1.957-3.322.449-1.193.68-2.278.752-2.806a1 1 0 01.588-.778z"
                                  clipRule="evenodd"
                                  fill={getBackgroundColor({
                                    heatLevel: state.longestStreak / 7,
                                  })}
                                ></path>
                              </g>
                              <defs>
                                <linearGradient
                                  id="hot-filled_svg__paint0_linear_289_12318"
                                  x1="12"
                                  x2="12"
                                  y1="2"
                                  y2="22"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FFA116"></stop>
                                  <stop offset="1" stopColor="#F9772E"></stop>
                                </linearGradient>
                                <filter
                                  id="hot-filled_svg__filter0_i_289_12318"
                                  width="17.2"
                                  height="21.2"
                                  x="4"
                                  y="2"
                                  colorInterpolationFilters="sRGB"
                                  filterUnits="userSpaceOnUse"
                                >
                                  <feFlood
                                    floodOpacity="0"
                                    result="BackgroundImageFix"
                                  ></feFlood>
                                  <feBlend
                                    in="SourceGraphic"
                                    in2="BackgroundImageFix"
                                    result="shape"
                                  ></feBlend>
                                  <feColorMatrix
                                    in="SourceAlpha"
                                    result="hardAlpha"
                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                  ></feColorMatrix>
                                  <feOffset dx="1.2" dy="1.2"></feOffset>
                                  <feGaussianBlur stdDeviation="0.6"></feGaussianBlur>
                                  <feComposite
                                    in2="hardAlpha"
                                    k2="-1"
                                    k3="1"
                                    operator="arithmetic"
                                  ></feComposite>
                                  <feColorMatrix values="0 0 0 0 0.970833 0 0 0 0 0.05825 0 0 0 0 0 0 0 0 0.16 0"></feColorMatrix>
                                  <feBlend
                                    in2="shape"
                                    result="effect1_innerShadow_289_12318"
                                  ></feBlend>
                                </filter>
                              </defs>
                            </>
                          ) : (
                            <>
                              <path
                                fill="white" // Set the fill color to red
                                fillRule="evenodd"
                                d="M7.19 1.564a.75.75 0 01.729.069c2.137 1.475 3.373 3.558 3.981 5.002l.641-.663a.75.75 0 011.17.115c1.633 2.536 1.659 5.537.391 7.725-1.322 2.282-3.915 2.688-5.119 2.688-1.177 0-3.679-.203-5.12-2.688-.623-1.076-.951-2.29-.842-3.528.109-1.245.656-2.463 1.697-3.54.646-.67 1.129-1.592 1.468-2.492.337-.895.51-1.709.564-2.105a.75.75 0 01.44-.583zm.784 2.023c-.1.368-.226.773-.385 1.193-.375.997-.947 2.13-1.792 3.005-.821.851-1.205 1.754-1.282 2.63-.078.884.153 1.792.647 2.645C6.176 14.81 7.925 15 8.983 15c1.03 0 2.909-.366 3.822-1.94.839-1.449.97-3.446.11-5.315l-.785.812a.75.75 0 01-1.268-.345c-.192-.794-1.04-2.948-2.888-4.625z"
                                clipRule="evenodd"
                              ></path>
                            </>
                          )}
                        </Box>
                      </Text>
                    </Text>
                  </>
                )}
                {state.streak === 0 && state.longestStreak === 0 && (
                  <>
                    <Text
                      textAlign={"center"}
                      color={"#FFFFFF"}
                      p={0}
                      m={0}
                      fontWeight={"bold"}
                      fontStyle={"italic"}
                      fontSize={"1.2em"}
                      borderLeft={"5px solid #CCCCCC"}
                      paddingLeft={"10px"}
                    >
                      Get started now and see how far your streak can take you!
                    </Text>
                  </>
                )}
                {state.streak === 0 && state.longestStreak > 0 && (
                  <>
                    <Text
                      textAlign={"center"}
                      color={"#FFFFFF"}
                      p={0}
                      m={0}
                      fontWeight={"bold"}
                      fontStyle={"italic"}
                      fontSize={"1.2em"}
                      borderLeft={"5px solid #CCCCCC"}
                      paddingLeft={"10px"}
                    >
                      Every day is a fresh start to unlock new achievements and
                      rewards!
                    </Text>
                  </>
                )}
                {state.streak > 0 &&
                  state.streak % 7 < 5 &&
                  state.streak % 7 !== 0 &&
                  state.longestStreak === state.streak && (
                    <>
                      <Text
                        textAlign={"center"}
                        color={"#FFFFFF"}
                        p={0}
                        m={0}
                        fontWeight={"bold"}
                        fontStyle={"italic"}
                        fontSize={"1.2em"}
                        borderLeft={"5px solid #CCCCCC"}
                        paddingLeft={"10px"}
                      >
                        Keep up the fantastic work! Your consistency is key to
                        unlocking even more rewards and achievements.
                      </Text>
                    </>
                  )}
                {state.streak > 0 &&
                  state.streak % 7 < 5 &&
                  state.streak % 7 !== 0 &&
                  state.longestStreak > state.streak && (
                    <Text
                      textAlign={"center"}
                      color={"#FFFFFF"}
                      p={0}
                      m={0}
                      fontWeight={"bold"}
                      fontStyle={"italic"}
                      fontSize={"1.2em"}
                      borderLeft={"5px solid #CCCCCC"}
                      paddingLeft={"10px"}
                    >
                      "Every day counts towards your success. Keep striving for
                      greatness!"
                    </Text>
                  )}
                {state.streak > 0 && state.streak % 7 >= 5 && (
                  <>
                    <Text
                      textAlign={"center"}
                      color={"#FFFFFF"}
                      p={0}
                      m={0}
                      fontWeight={"bold"}
                      fontStyle={"italic"}
                      fontSize={"1.2em"}
                      borderLeft={"5px solid #CCCCCC"}
                      paddingLeft={"10px"}
                    >
                      Just a little more effort and you'll unlock something
                      special. Keep up the fantastic work!
                    </Text>
                  </>
                )}
                {state.streak > 0 && state.streak % 7 === 0 && (
                  <>
                    <Text
                      textAlign={"center"}
                      color={"#FFFFFF"}
                      p={0}
                      m={0}
                      fontWeight={"bold"}
                      fontStyle={"italic"}
                      fontSize={"1.2em"}
                      borderLeft={"5px solid #CCCCCC"}
                      paddingLeft={"10px"}
                    >
                      "Take advantage of this boost to conquer new challenges
                      and reach even greater heights!"
                    </Text>
                  </>
                )}
              </ModalBody>
              <ModalFooter justifyContent="center">
                <Button
                  colorScheme="green"
                  onClick={() => {
                    onClose();
                    setShowDailyStreakModal(false);
                  }}
                >
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyStreakModal;
