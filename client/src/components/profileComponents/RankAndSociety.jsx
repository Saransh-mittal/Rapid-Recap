import { Box, Flex, Image, Text } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";

import circle from "/images/circle.png";
import Arrow from "/images/arrow.png";
import Lightning from "./RankAndSocietySubCompnents/Lightning"; // Import the Lightning component
import CircleAndSocietyData from "../../assets/CircleAndSocietyData";
import { AppContext } from "../../contextAPI/appContext";
import Loading from "../miscellaneous/Loading";

const RankAndSociety = ({ USER_IQ = 0 }) => {
  const { state, dispatch } = useContext(AppContext);
  const [circleAndSociety, setCircleAndSociety] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const userIQ = USER_IQ;
    const circleAndSocietyData = CircleAndSocietyData;
    const userCircleAndSociety = circleAndSocietyData.filter(
      (data) =>
        data.IQ_Lower <= userIQ &&
        (data.IQ_Upper ? data.IQ_Upper > userIQ : true)
    );

    setCircleAndSociety(...userCircleAndSociety);
    setIsLoading(false);
  }, [USER_IQ]);
  return (
    <Flex
      margin="10px"
      w={"100%"}
      flexDirection={"column"}
      position="relative"
      mt={4}
      mr={1}
      ml={6}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Box flexDirection={"column"} width={"100%"}>
            <Text textAlign={"left"} color={"#9CAFAA"} p={0} m={0}>
              Society and Circle
            </Text>
          </Box>
          <Flex mt={5} flexDirection={"column"} w={"100%"}>
            <Flex width={"100%"}>
              <Flex
                justifyContent={"center"}
                alignItems={"center"}
                w={"100%"}
                position="relative"
              >
                <motion.img
                  src={circleAndSociety.image}
                  alt="Brain"
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "transparent",
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
                {/* Position the Lightning component over the Avatar */}
                <Lightning />
              </Flex>
              <Flex
                width={"80%"}
                alignItems={"center"}
                justifyContent={"center"}
                marginTop={"1.5rem"}
              >
                <Image
                  w={"70px"}
                  h={"70px"}
                  background={"transparent"}
                  src={Arrow}
                />
              </Flex>
              <Flex w={"100%"} position={"relative"}>
                <div
                  style={{
                    position: "relative",
                    width: "140px",
                    height: "140px",
                  }}
                >
                  <img
                    src={circle}
                    alt="Circle"
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "transparent",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "#9CAFAA",
                        fontSize: "0.8rem",
                        margin: 0,
                      }}
                    >
                      {circleAndSociety.IQ_Lower}
                    </span>
                    <span
                      style={{
                        color: "#9CAFAA",
                        fontSize: "0.8rem",
                        margin: 0,
                      }}
                    >
                      to
                    </span>
                    <span
                      style={{
                        color: "#9CAFAA",
                        fontSize: "0.8rem",
                        margin: 0,
                      }}
                    >
                      {circleAndSociety.IQ_Upper} IQ
                    </span>
                  </div>
                </div>
              </Flex>
            </Flex>
            <Flex
              mt={5}
              w={"100%"}
              alignItems={"center"}
              justifyContent={"space-between"}
              paddingLeft={{ base: "9.5%", md: "9.5%", xl: "3.5%" }}
              // paddingRight={9}
            >
              <Text
                textAlign="center"
                fontSize="lg"
                fontWeight="bold"
                color="#436850"
                textShadow="2px 2px 4px rgba(0,0,0,0.4)" // Add text shadow for depth
              >
                {circleAndSociety.society}
              </Text>
              <Text
                textAlign="center"
                fontSize="lg"
                fontWeight="bold"
                color="#436850"
                textShadow="2px 2px 4px rgba(0,0,0,0.4)" // Add text shadow for depth
              >
                {circleAndSociety.circle}
              </Text>
            </Flex>
          </Flex>
        </>
      )}
    </Flex>
  );
};

export default RankAndSociety;
