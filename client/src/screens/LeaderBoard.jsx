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
  useMediaQuery,
} from "@chakra-ui/react";
import medalIcon from "../assets/medal.png";
import axios from "axios";
import { useState, useEffect, useContext } from "react";
import Loading from "../components/miscellaneous/Loading";
import { AppContext } from "../contextAPI/appContext";
import { useNavigate } from "react-router-dom";
import NameLightning from "../components/miscellaneous/NameLightning";
import CircleAndSocietyData from "../assets/CircleAndSocietyData";
import VerticalDotsSeparator from "../components/leaderBoardComponents/VerticalDotsSeparator";
import { debounce } from "lodash";
import { useLeaderBoardTour } from "../customHooks/useTours";

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
  const navigate = useNavigate();
  const { state } = useContext(AppContext);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchLoad, setSearchLoad] = useState(false);
  const [leaders, setLeaders] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currUserChar, setCurrUserChar] = useState(null);
  const [activeSociety, setActiveSociety] = useState(null);
  const { tour, isTutorialTakenCheck } = useLeaderBoardTour();
  const [isLgScreen] = useMediaQuery("(max-width: 1024px)");
  const [isMdScreen] = useMediaQuery("(max-width: 820px)");
  const [isBaseScreen] = useMediaQuery("(max-width: 768px)");

  const fetchLeaderBoard = async (society = "") => {
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
    if (activeSociety === society) {
      setActiveSociety(null);
      fetchLeaderBoard();
    } else {
      setActiveSociety(society);
      fetchLeaderBoard(society);
    }
  };

  useEffect(() => {
    handleLoginAlert();
  }, [state.show]);

  useEffect(() => {
    document.title = "LeaderBoard Page";
    if (!state.show) {
      fetchLeaderBoard();
    }
  }, []);

  useEffect(() => {
    if (
      !isLoading &&
      !state.show &&
      state.user &&
      state.user.tutorial.leaderBoardPage
    )
      isTutorialTakenCheck({ page: "leaderBoardPage", tour });
  }, [isLoading]);

  const findSocietyAndCircle = (IQ) => {
    for (let i = 0; i < CircleAndSocietyData.length; i++) {
      const { IQ_Lower, IQ_Upper } = CircleAndSocietyData[i];
      if (IQ >= IQ_Lower && (IQ_Upper === null || IQ < IQ_Upper)) {
        return CircleAndSocietyData[i];
      }
    }
    return null;
  };

  const handleSearch = async (event) => {
    setSearchLoad(true);
    try {
      const { value } = event.target;
      setSearchQuery(value);
      if (value === "") {
        setSearchLoad(false);
        setSearchResults([]);
        debouncedSearch.cancel();
        return;
      }
      debouncedSearch(value, (responseData) => {
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
      });
    } catch (err) {
      console.log(err);
    }
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
        w={"100%"}
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
            <Flex
              alignItems="center"
              justifyContent="center"
              marginBottom="20px"
              marginTop={"20px"}
            >
              <Input
                w={"50%"}
                placeholder="Search for users..."
                value={searchQuery}
                onChange={handleSearch}
                color={"white"}
              />
            </Flex>
            <Flex justifyContent={"center"} gap={5} flexDirection={"row"}>
              <Flex
                justifyContent={"center"}
                gap={5}
                flexDirection={isBaseScreen ? "column" : "row"}
              >
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
              <Flex
                justifyContent={"center"}
                gap={5}
                flexDirection={isBaseScreen ? "column" : "row"}
              >
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
            <TableContainer
              width={"100%"}
              className="mainBoard"
              overflowX="auto"
            >
              <Table variant={"unstyled"}>
                <TableCaption color={"white"} placement="top">
                  "Where Champions Stand Out!"
                </TableCaption>
                <Thead>
                  <Tr boxShadow={"dark-lg"} letterSpacing={"2px"}>
                    <Th textAlign={"center"} bg={"green.300"} color={"white"}>
                      Rank
                    </Th>
                    {!isBaseScreen && (
                      <Th textAlign={"center"} bg={"red.300"}>
                        Name
                      </Th>
                    )}
                    <Th textAlign={"center"} bg={"blue.300"} px={"0.5rem"}>
                      In Game Name
                    </Th>

                    <Th textAlign={"center"} bg={"orange.300"}>
                      IQ Scores
                    </Th>

                    {!isLgScreen && (
                      <Th textAlign={"center"} bg={"teal.300"}>
                        Quiz Submissions
                      </Th>
                    )}
                    {!isMdScreen && (
                      <Th textAlign={"center"} bg={"pink.300"}>
                        Avg. RQM Scores
                      </Th>
                    )}
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
                          const urlInGameName = user?.inGameName?.replace(
                            /\./g,
                            "%2E"
                          );
                          return (
                            <Tr
                              height={"80px"}
                              key={user._id}
                              className={
                                state.user.inGameName === user.inGameName
                                  ? "highlighted-card-2"
                                  : ""
                              }
                              onClick={() =>
                                navigate(`/profile/${urlInGameName}`)
                              }
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
                                  {!isBaseScreen && (
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
                                        style={{ transform: "rotate(-45deg)" }}
                                      >
                                        <Image
                                          h={"100%"}
                                          w={"100%"}
                                          src={user.pic}
                                          alt="User profile picture"
                                          objectFit={"cover"}
                                        />
                                      </Box>
                                    </Flex>
                                  )}
                                </Flex>
                              </Td>
                              {!isBaseScreen && (
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
                              )}
                              <Td textAlign="center">{user.inGameName}</Td>

                              <Td textAlign="center">{user.IQ_score}</Td>

                              {!isLgScreen && (
                                <Td textAlign="center">
                                  {user.quizSubmissions}
                                </Td>
                              )}
                              {!isMdScreen && (
                                <Td textAlign="center">{user.RQM_avg}</Td>
                              )}
                            </Tr>
                          );
                        }
                      )}
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
                          onClick={() =>
                            navigate(`/profile/${state.user.inGameName}`)
                          }
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
                                  style={{ transform: "rotate(-45deg)" }}
                                >
                                  <Image
                                    h={"100%"}
                                    w={"100%"}
                                    src={state.user.pic}
                                    alt="User profile picture"
                                    objectFit={"cover"}
                                  />
                                </Box>
                              </Flex>
                            </Flex>
                          </Td>
                          {!isBaseScreen && (
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
                                  boxShadow={
                                    findSocietyAndCircle(50)?.boxShadow
                                  }
                                  MAX_IQ={"100"}
                                />
                              </Flex>
                            </Td>
                          )}
                          <Td textAlign="center">{state.user.inGameName}</Td>
                          {!isMdScreen && (
                            <Td textAlign="center">{state.user.IQ_score}</Td>
                          )}
                          {!isLgScreen && (
                            <Td textAlign="center">
                              {currUserChar?.quizSubmissions}
                            </Td>
                          )}
                          <Td textAlign="center">{currUserChar?.RQM_avg}</Td>
                        </Tr>
                      </>
                    )}
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
