import React, { useContext, useEffect, useState } from "react";
import { Flex, Image, Tooltip, Text, Tag } from "@chakra-ui/react";
import { motion } from "framer-motion";
import circle from "/images/circle.png";
import Arrow from "/images/arrow.png";
import Lightning from "./RankAndSocietySubCompnents/Lightning";
import CircleAndSocietyData from "../../assets/CircleAndSocietyData";
import { AppContext } from "../../contextAPI/appContext";
import Loading from "../miscellaneous/Loading";
import BrainModal from "./RankAndSocietySubCompnents/BrainModal";
import CircleModal from "./RankAndSocietySubCompnents/CircleModal"; // Import CircleModal

const RankAndSociety = ({
  USER_IQ = 0,
  privateSociety,
  loginedUserProfile,
}) => {
  const { state, dispatch } = useContext(AppContext);
  const [circleAndSociety, setCircleAndSociety] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for BrainModal
  const [isCircleModalOpen, setIsCircleModalOpen] = useState(false); // State for CircleModal
  const [showBrainModal, setShowBrainModal] = useState(false);

  useEffect(() => {
    const userIQ = USER_IQ;
    const circleAndSocietyData = CircleAndSocietyData;
    const userCircleAndSociety = circleAndSocietyData.filter(
      (data) =>
        data.IQ_Lower <= userIQ &&
        (data.IQ_Upper ? data.IQ_Upper > userIQ : true)
    );

    setCircleAndSociety(userCircleAndSociety[0] || {});
    setIsLoading(false);
  }, [USER_IQ]);

  const handleBrainClick = () => {
    setShowBrainModal(true);
    setIsModalOpen(true); // Open the BrainModal upon clicking the brain image
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the BrainModal
  };

  const handleCircleClick = () => {
    setIsCircleModalOpen(true); // Open the CircleModal upon clicking the circle image
  };

  const handleCloseCircleModal = () => {
    setIsCircleModalOpen(false); // Close the CircleModal
  };

  return (
    <Flex
      margin="10px"
      w="100%"
      flexDirection="column"
      position="relative"
      mt={4}
      mr={1}
      ml={6}
    >
      {privateSociety ? (
        <Flex
          h={"100%"}
          w={"100%"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Text
            backgroundColor="#0f0d15"
            m={0}
            top={0}
            right={10}
            color={"#9CAFAA"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            w={"60px"}
            height={"30px"}
          >
            Hidden
          </Text>
        </Flex>
      ) : isLoading ? (
        <Loading />
      ) : (
        <>
          <Flex flexDirection="column" width="100%">
            <Text textAlign="left" color="#9CAFAA" p={0} m={0}>
              Society and Circle
            </Text>
            {loginedUserProfile && (
              <Tooltip label="Visibility to others">
                <Tag
                  backgroundColor="#0f0d15"
                  m={0}
                  position={"absolute"}
                  top={0}
                  right={2}
                  color={"#9CAFAA"}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  w={"60px"}
                  height={"30px"}
                >
                  {state.user.profilePrivacy.society ? "HIDDEN" : "VISIBLE"}
                </Tag>
              </Tooltip>
            )}
          </Flex>
          <Flex mt={5} flexDirection="column" w="100%">
            <Flex width="100%">
              <Flex
                justifyContent="center"
                alignItems="center"
                w="100%"
                position="relative"
                flexDirection="column"
                onClick={handleBrainClick} // Add onClick handler to the brain image
                style={{ cursor: "pointer" }} // Change cursor to pointer to indicate it's clickable
              >
                <Flex>
                  <motion.img
                    src={circleAndSociety.image}
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
                  fontSize="lg"
                  fontWeight="bold"
                  color="#436850"
                  textShadow="2px 2px 4px rgba(0,0,0,0.4)"
                  paddingLeft={{ base: "5.5%", md: "9.5%", xl: "0.5%" }}
                >
                  {circleAndSociety.society}
                </Text>
              </Flex>

              <Flex
                width="80%"
                alignItems="center"
                justifyContent="center"
                marginTop="-5%"
              >
                <Image
                  w="70px"
                  h="70px"
                  background="transparent"
                  mt={-10}
                  src={Arrow}
                />
              </Flex>
              <Flex w="100%" position="relative">
                <div
                  style={{
                    position: "relative",
                    width: "140px",
                    height: "140px",
                    marginTop: "-11%",
                    cursor: "pointer",
                  }}
                  onClick={handleCircleClick} // Add onClick handler to the circle
                  // Change cursor to pointer to indicate it's clickable
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
                      mt: "3px",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {circleAndSociety.IQ_Upper != null &&
                    circleAndSociety.IQ_Lower != 150 ? (
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
                    ) : (
                      <>
                        <span
                          style={{
                            color: "#9CAFAA",
                            fontSize: "0.8rem",
                            margin: 0,
                          }}
                        >
                          {circleAndSociety.IQ_Lower}+
                        </span>
                        <span
                          style={{
                            color: "#9CAFAA",
                            fontSize: "0.8rem",
                            margin: 0,
                          }}
                        >
                          IQ
                        </span>
                      </>
                    )}
                  </div>
                  <Text
                    textAlign="center"
                    fontSize="lg"
                    fontWeight="bold"
                    color="#436850"
                    textShadow="2px 2px 4px rgba(0,0,0,0.4)"
                  >
                    {circleAndSociety.circle}
                  </Text>
                </div>
              </Flex>
            </Flex>
            <Flex
              mt={5}
              w="100%"
              alignItems="center"
              justifyContent="space-between"
            ></Flex>
          </Flex>
        </>
      )}
      {/* Modals */}
      {showBrainModal && <BrainModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentUserSociety={"Mavericks"}
        setShowBrainModal={setShowBrainModal}
      />}
      <CircleModal
        isOpen={isCircleModalOpen}
        onClose={handleCloseCircleModal}
      />{" "}
      {/* Pass the state and handler */}
    </Flex>
  );
};

export default RankAndSociety;
