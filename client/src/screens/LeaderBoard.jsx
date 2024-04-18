import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  Spinner,
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
import { debounce, set } from "lodash";

const debouncedSearch = debounce(async (query, callback) => {
  try {
    if (!query || query === "") return;
    const response = await axios.get(`/api/user/search?query=${query}`);

    callback(response.data); // Pass the response data to the callback function
  } catch (error) {
    console.error("Error searching users:", error);
    // Handle error, show toast, etc.
  }
}, 800);

const LeaderBoard = () => {
  // const profileIndex = 49;
  const navigate = useNavigate();
  const { state } = useContext(AppContext);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchLoad, setSearchLoad] = useState(false);
  const [leaders, setLeaders] = useState([]);
  const [searchResults, setSearchResults] = useState([]); // Add this line
  const [searchQuery, setSearchQuery] = useState("");
  const [currUserChar, setCurrUserChar] = useState(null);
  const [activeSociety, setActiveSociety] = useState(null);
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

  const fetchLeaderBoard = async (society = "") => {
    //etIsLoading(true);
    setSearchLoad(true);
    try {
      const response = await axios.get(
        `/api/user/leaderboard?society=${society}`
      );
      setLeaders(response.data.users);
      setCurrUserChar(response.data.currUser);
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
      setSearchLoad(false);
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

  const handleSocietyButtonClick = (society) => {
    // If the clicked society is already active, deselect it
    if (activeSociety === society) {
      setActiveSociety(null);
      fetchLeaderBoard();
    } else {
      // Otherwise, fetch leaderboard for the clicked society
      setActiveSociety(society);
      fetchLeaderBoard(society);
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

  const handleSearch = async (event) => {
    setSearchLoad(true);
    try {
      const { value } = event.target;
      //console.log(event.key);
      setSearchQuery(value);

      if (value === "") {
        // Check if value is empty or only contains whitespace
        setSearchLoad(false);
        setSearchResults([]); // Clear search results when query is empty
        debouncedSearch.cancel();
        return;
      }

      debouncedSearch(value, (responseData) => {
        // Handle response data
        if (!value || value === "") return;
        setSearchResults([...responseData]);

        if (responseData.length === 0)
          toast({
            title: "No user found",
            status: "info",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
        setSearchLoad(false);
        // Update state or perform other actions based on response data
      });
    } catch (err) {
      console.log(err);
    }
    // debouncedSearch(value);
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
            {/* Search bar */}
            <Flex
              alignItems="center"
              justifyContent="center"
              marginBottom="20px"
              marginTop={"20px"}
            >
              <Input
                placeholder="Search for users..."
                value={searchQuery}
                onChange={handleSearch}
                color={"white"}
              />
            </Flex>
            <Flex justifyContent={"center"} gap={5}>
              <Flex justifyContent={"center"} gap={5} flexDirection={{base:"column", md:"column",lg:"row" }}>
                <Button
                  isDisabled={searchLoad || isLoading}
                  isLoading={activeSociety === "titans" && searchLoad}
                  onClick={() => handleSocietyButtonClick("titans")}
                  w={"100%"}
                  m={2}
                  backgroundColor={"goldenrod"}
                  boxShadow="0 0 10px 5px rgba(255, 215, 0, 0.8)"
                  h={"30px"}
                  borderBottom={
                    activeSociety === "titans" ? "5px solid gold" : null
                  }
                >
                  Titans
                </Button>
                <Button
                  isDisabled={searchLoad || isLoading}
                  isLoading={activeSociety === "mavericks" && searchLoad}
                  onClick={() => handleSocietyButtonClick("mavericks")}
                  w={"100%"}
                  m={2}
                  backgroundColor={"darkorange"}
                  boxShadow="0 0 10px 5px rgba(255, 150, 0, 0.5)"
                  h={"30px"}
                  borderBottom={
                    activeSociety === "mavericks" ? "5px solid 	#C13315" : null
                  }
                >
                  Maverick
                </Button>
              </Flex>

              <Flex justifyContent={"center"} gap={5} flexDirection={{base:"column", md:"column",lg:"row" }}>
                <Button
                  isDisabled={searchLoad || isLoading}
                  isLoading={activeSociety === "elites" && searchLoad}
                  onClick={() => handleSocietyButtonClick("elites")}
                  w={"100%"}
                  m={2}
                  backgroundColor={"lightgreen"}
                  boxShadow="0 0 10px 5px rgba(0, 255, 100, 0.5)"
                  h={"30px"}
                  borderBottom={
                    activeSociety === "elites" ? "5px solid darkgreen" : null
                  }
                >
                  Elites
                </Button>
                <Button
                  isDisabled={searchLoad || isLoading}
                  isLoading={activeSociety === "strivers" && searchLoad}
                  onClick={() => handleSocietyButtonClick("strivers")}
                  w={"100%"}
                  m={2}
                  backgroundColor={"cornflowerblue"}
                  h={"30px"}
                  borderBottom={
                    activeSociety === "strivers" ? "5px solid darkblue" : null
                  }
                >
                  Strivers
                </Button>
              </Flex>
              <Flex justifyContent={"center"} gap={5}>
                <Button
                  isDisabled={searchLoad || isLoading}
                  isLoading={activeSociety === "explorers" && searchLoad}
                  textColor={"black"}
                  w={"100%"}
                  m={2}
                  h={"30px"}
                  onClick={() => handleSocietyButtonClick("explorers")}
                  borderBottom={
                    activeSociety === "explorers" ? "5px solid #C6C5C5" : null
                  }
                >
                  Explorers
                </Button>
              </Flex>
            </Flex>
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
                {searchLoad ? (
                  <Tbody marginTop={"20px"} className="Entries">
                    <Tr>
                      <Td colSpan={6} textAlign={"center"}>
                        <Spinner
                          thickness="4px"
                          speed="0.65s"
                          emptyColor="gray.200"
                          color="blue.500"
                          size="xl"
                        />
                      </Td>
                    </Tr>
                  </Tbody>
                ) : (
                  <Tbody marginTop={"20px"} className="Entries">
                    {leaders?.length > 0 &&
                      (searchResults.length > 0 ? searchResults : leaders).map(
                        (user, index) => {
                          //console.log(user);
                          const urlInGameName = user?.inGameName?.replace(
                            /\./g,
                            "%2E"
                          );
                          return (
                            <Tr // Clickable row to the profile of the user
                              height={"80px"}
                              key={user._id}
                              className={
                                state.user.inGameName === user.inGameName
                                  ? "highlighted-card-2"
                                  : ""
                              }
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
                                  {user.rank ? user.rank : index + 1}
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
                                        src={user.pic}
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
                                      findSocietyAndCircle(user.IQ_score)
                                        ?.textColor
                                    }
                                    marginTop={"5px"}
                                  >
                                    {user.name}
                                  </Heading>
                                  <NameLightning
                                    boxShadow={
                                      findSocietyAndCircle(user.maxIQScore)
                                        ?.boxShadow
                                    }
                                    MAX_IQ={user.maxIQScore}
                                  />
                                </Flex>
                              </Td>
                              <Td textAlign="center">{user.inGameName}</Td>
                              <Td textAlign="center">{user.IQ_score}</Td>
                              <Td textAlign="center">{user.quizSubmissions}</Td>
                              <Td textAlign="center">{user.RQM_avg}</Td>
                            </Tr>
                          );
                        }
                      )}
                    {/* <div className="highlighted-card-0"> */}
                    {state.user.rank > 50 && (
                      <>
                        <Tr>
                          <Td>
                            <VerticalDotsSeparator />
                          </Td>
                        </Tr>
                        <Tr
                          height={"80px"}
                          key={"51"}
                          className="highlighted-card-3"
                          onClick={() => {
                            navigate(`/profile/${state.user.inGameName}`);
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
                              z-index={"99999999"}
                              borderRadius="md"
                            >
                              {state.user.rank}
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
                                    src={state.user.pic}
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
                                {state.user.name}
                              </Heading>
                              <NameLightning
                                boxShadow={findSocietyAndCircle(50)?.boxShadow}
                                MAX_IQ={"100"}
                              />
                            </Flex>
                          </Td>
                          <Td textAlign="center">{state.user.inGameName}</Td>
                          <Td textAlign="center">{state.user.IQ_score}</Td>
                          <Td textAlign="center">
                            {currUserChar?.quizSubmissions}
                          </Td>
                          <Td textAlign="center">{currUserChar?.RQM_avg}</Td>
                        </Tr>
                      </>
                    )}

                    {/* </div> */}
                    <Tr>
                      <Td>
                        <div style={{ padding: "10px 10px" }}></div>
                      </Td>
                    </Tr>
                  </Tbody>
                )}
              </Table>
            </TableContainer>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default LeaderBoard;
