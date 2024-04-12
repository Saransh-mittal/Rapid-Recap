import {
  Box,
  Flex,
  Heading,
  Image,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import medalIcon from "../assets/medal.png";
import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { useShepherdTour } from "react-shepherd";
import Loading from "../components/miscellaneous/Loading";
import stepsLeaderBoard from "../components/leaderBoardComponents/stepsLeaderBoard"; // Assuming stepsLeaderBoard.js is in the same directory
import { tourOptions } from "../components/leaderBoardComponents/stepsLeaderBoard";
import { AppContext } from "../contextAPI/appContext";
import { useNavigate } from "react-router-dom";
import NameLightning from "../components/miscellaneous/NameLightning";
import CircleAndSocietyData from "../assets/CircleAndSocietyData";
import VerticalDotsSeparator from "../components/leaderBoardComponents/VerticalDotsSeparator";

const LeaderBoard = () => {
  const navigate = useNavigate();
  const { state } = useContext(AppContext);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [leaders, setLeaders] = useState([]);
  const tour = useShepherdTour({
    tourOptions,
    steps: stepsLeaderBoard,
  });

  const isTutorialTakenCheck = async () => {
    try {
      const Page = "leaderBoardPage";
      const response = await axios.get(
        `/api/user/isTutorialTakenCheck/${Page}`
      );
      console.log(response.data);
      if (response.data.status) tour.start();
    } catch (err) {
      toast({
        title: "Error in Checking tutorial taken",
        description: err,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };
  const isTutorialTakenUpdate = async () => {
    try {
      const page = "leaderBoardPage";
      const response = await axios.post(`/api/user/isTutorialTakenUpdate`, {
        page,
      });
      console.log(response.data);
    } catch (err) {
      toast({
        title: "Error in updating tutorial taken",
        description: err,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const fetchLeaderBoard = async () => {
    try {
      const response = await axios.get("/api/user/leaderboard");
      setLeaders(response.data.users);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch leaderboard",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      // console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleLoginAlert = () => {
    if (state.show) {
      navigate("/signin");
      toast({
        title: "Please Sign In First",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };
  useEffect(() => {
    handleLoginAlert();
  }, [state.show]);
  useEffect(() => {
    if (!state.show) {
      fetchLeaderBoard();
      if (state.user && state.user.tutorial.leaderBoardPage)
        isTutorialTakenCheck();
    }
  }, []);

  useEffect(() => {
    const body = document.querySelector("body");
    const handleTourStart = () => {
      body.style.overflow = "hidden"; // Reapply scroll behavior
      const overlay = document.createElement("div");
      overlay.classList.add("custom-overlay");
      const overlayNav = document.createElement("div");
      overlayNav.classList.add("custom-overlay-nav");
      document.querySelector(".leaderboard")?.appendChild(overlay);
      document.querySelector(".leaderboard")?.classList.add("shepherd-active");
      document.querySelector(".navbar").appendChild(overlayNav);
      document.querySelector(".navbar").classList.add("shepherd-active");
    };

    const handleTourComplete = () => {
      body.style.overflow = "auto";
      const navbar = document.querySelector(".navbar");
      navbar.classList.remove("shepherd-active");

      document
        .querySelector(".leaderboard")
        ?.classList.remove("shepherd-active");
      const overlay = document.querySelector(".custom-overlay");
      if (overlay) overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      if (overlayNav) overlayNav.remove();
      isTutorialTakenUpdate();
    };

    const handleTourCancel = () => {
      body.style.overflow = "auto";
      const navbar = document.querySelector(".navbar");
      navbar.classList.remove("shepherd-active");
      document
        .querySelector(".leaderboard")
        ?.classList.remove("shepherd-active");
      const overlay = document.querySelector(".custom-overlay");
      if (overlay) overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      if (overlayNav) overlayNav.remove();
      isTutorialTakenUpdate();
    };

    tour.on("start", handleTourStart);
    tour.on("complete", handleTourComplete);
    tour.on("cancel", handleTourCancel);

    return () => {
      tour.off("start", handleTourStart);
      tour.off("complete", handleTourComplete);
      tour.off("cancel", handleTourCancel);
    };
  }, [tour]);

  const findSocietyAndCircle = (IQ) => {
    for (let i = 0; i < CircleAndSocietyData.length; i++) {
      const { IQ_Lower, IQ_Upper } = CircleAndSocietyData[i];
      if (IQ >= IQ_Lower && (IQ_Upper === null || IQ < IQ_Upper)) {
        return CircleAndSocietyData[i];
      }
    }
    return null; // Return null if no match is found
  };

  return (
    <Flex
      minH={"85vh"}
      justifyContent={"center"}
      className="leaderboard"
      marginTop={"4.5rem"}
    >
      <Flex
        margin={"20px"}
        justifyContent={"center"}
        w={"80%"}
        flexDirection={"column"}
      >
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <Heading>
              <Flex
                alignItems={"center"}
                gap={"10px"}
                justifyContent={"center"}
              >
                <Image
                  src={medalIcon}
                  alt="Rating"
                  width={"35px"}
                  height={"35px"}
                  bg={"none"}
                />
                LEADERBOARD
                <Image
                  src={medalIcon}
                  alt="Rating"
                  width={"35px"}
                  height={"35px"}
                  bg={"none"}
                />
              </Flex>
            </Heading>
            <TableContainer width={"100%"} className="mainBoard">
              <Table variant={"unstyled"}>
                <TableCaption color={"white"} placement="top">
                  "Where Champions Stand Out!"
                </TableCaption>
                <Thead>
                  <Tr boxShadow={"dark-lg"}>
                    <Th textAlign={"center"} bg={"green.300"} color={"white"}>
                      Rank
                    </Th>
                    <Th textAlign={"center"} bg={"red.300"}>
                      Name
                    </Th>
                    <Th textAlign={"center"} bg={"blue.300"}>
                      In Game Name
                    </Th>
                    <Th textAlign={"center"} bg={"orange.300"}>
                      IQ Scores
                    </Th>
                    <Th textAlign={"center"} bg={"teal.300"}>
                      Quiz Submissions
                    </Th>
                    <Th textAlign={"center"} bg={"pink.300"}>
                      Avg. RQM Scores
                    </Th>
                  </Tr>
                </Thead>

                <Tbody marginTop={"20px"} className="Entries">
                  {leaders?.length > 0 &&
                    leaders.map((leader, index) => {
                      const urlInGameName = leader.inGameName.replace(
                        /\./g,
                        "%2E"
                      );
                      return (
                        <Tr // Clickable row to the profile of the user
                          height={"80px"}
                          key={leader._id}
                          onClick={() => {
                            navigate(`/profile/${urlInGameName}`);
                          }}
                          _hover={{
                            backgroundImage:
                              "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
                            boxShadow:
                              "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
                          }}
                          cursor={"pointer"}
                        >
                          <Td textAlign={"center"}>
                            <Flex
                              justifyContent={"center"}
                              alignItems={"center"}
                              bgGradient="linear(to-b, #1a1527, #0e0c16 88%, #0e0c16 99%)"
                              p={2}
                              gap={"35px"}
                              borderRadius="md"
                            >
                              {index + 1}
                              <Flex
                                border={"5px solid gold"}
                                style={{ transform: "rotate(45deg)" }}
                                w="45px"
                                h="45px"
                                justifyContent={"center"}
                                alignItems={"center"}
                                bg={"blue.200"}
                                position={"relative"}
                                overflow={"hidden"}
                              >
                                <Box
                                  position={"absolute"}
                                  h="50px"
                                  w="50px"
                                  style={{
                                    transform: "rotate(-45deg)",
                                  }}
                                >
                                  <Image
                                    h={"100%"}
                                    w={"100%"}
                                    src={leader.pic}
                                    alt="Dan Abramov"
                                    objectFit={"cover"}
                                  />
                                </Box>
                              </Flex>
                            </Flex>
                          </Td>
                          <Td>
                            <Flex
                              justifyContent={"center"}
                              alignItems={"center"}
                              w={"100%"}
                              position="relative"
                            >
                              <Heading
                                as="h6"
                                size={"xs"}
                                color={
                                  findSocietyAndCircle(leader.IQ_score)
                                    ?.textColor
                                }
                                marginTop={"5px"}
                              >
                                {leader.name}
                              </Heading>
                              <NameLightning
                                boxShadow={
                                  findSocietyAndCircle(leader.maxIQScore)
                                    ?.boxShadow
                                }
                                MAX_IQ={leader.maxIQScore}
                              />
                            </Flex>
                          </Td>
                          <Td textAlign="center">{leader.inGameName}</Td>
                          <Td textAlign="center">{leader.IQ_score}</Td>
                          <Td textAlign="center">{leader.quizSubmissions}</Td>
                          <Td textAlign="center">{leader.RQM_avg}</Td>
                        </Tr>
                      );
                    })}
                  <VerticalDotsSeparator />
                  <Tr // Clickable row to the profile of the user
                    height={"80px"}
                    key={"51"}
                    onClick={() => {
                      navigate("/profile/smash_dev");
                    }}
                    _hover={{
                      backgroundImage:
                        "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
                      boxShadow:
                        "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
                    }}
                    cursor={"pointer"}
                  >
                    <Td textAlign={"center"}>
                      <Flex
                        justifyContent={"center"}
                        alignItems={"center"}
                        bgGradient="linear(to-b, #1a1527, #0e0c16 88%, #0e0c16 99%)"
                        p={2}
                        gap={"35px"}
                        borderRadius="md"
                      >
                        {55 + 1}
                        <Flex
                          border={"5px solid gold"}
                          style={{ transform: "rotate(45deg)" }}
                          w="45px"
                          h="45px"
                          justifyContent={"center"}
                          alignItems={"center"}
                          bg={"blue.200"}
                          position={"relative"}
                          overflow={"hidden"}
                        >
                          <Box
                            position={"absolute"}
                            h="50px"
                            w="50px"
                            style={{
                              transform: "rotate(-45deg)",
                            }}
                          >
                            <Image
                              h={"100%"}
                              w={"100%"}
                              src={
                                "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                              }
                              alt="Dan Abramov"
                              objectFit={"cover"}
                            />
                          </Box>
                        </Flex>
                      </Flex>
                    </Td>
                    <Td>
                      <Flex
                        justifyContent={"center"}
                        alignItems={"center"}
                        w={"100%"}
                        position="relative"
                      >
                        <Heading
                          as="h6"
                          size={"xs"}
                          color={findSocietyAndCircle(50)?.textColor}
                          marginTop={"5px"}
                        >
                          {"Gaurav"}
                        </Heading>
                        <NameLightning
                          boxShadow={findSocietyAndCircle(50)?.boxShadow}
                          MAX_IQ={"100"}
                        />
                      </Flex>
                    </Td>
                    <Td textAlign="center">{"smash_dev"}</Td>
                    <Td textAlign="center">{"50"}</Td>
                    <Td textAlign="center">{"5"}</Td>
                    <Td textAlign="center">{"100"}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default LeaderBoard;
