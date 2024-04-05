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
import { useState, useEffect } from "react";
import { useShepherdTour } from "react-shepherd";
import Loading from "../components/miscellaneous/Loading";

const LeaderBoard = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [leaders, setLeaders] = useState(null);
  const tour = useShepherdTour({
    tourOptions,
    steps: stepsLeaderBoard,
  });

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
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderBoard();
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

  useEffect(() => {
    tour.start();
  }, []);

  return (
    <Flex
      minH={"85vh"}
      justifyContent={"center"}
      className="leaderboard"
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
            <TableContainer
              width={"100%"}
              className="mainBoard"
            >
              <Table variant={"unstyled"}>
                <TableCaption
                  color={"white"}
                  placement="top"
                >
                  "Where Champions Stand Out!"
                </TableCaption>
                <Thead>
                  <Tr boxShadow={"dark-lg"}>
                    <Th
                      textAlign={"center"}
                      bg={"green.300"}
                      color={"white"}
                    >
                      Rank
                    </Th>
                    <Th
                      textAlign={"center"}
                      bg={"red.300"}
                    >
                      Name
                    </Th>
                    <Th
                      textAlign={"center"}
                      bg={"blue.300"}
                    >
                      In Game Name
                    </Th>
                    <Th
                      textAlign={"center"}
                      bg={"orange.300"}
                    >
                      IQ Scores
                    </Th>
                    <Th
                      textAlign={"center"}
                      bg={"teal.300"}
                    >
                      Quiz Submissions
                    </Th>
                    <Th
                      textAlign={"center"}
                      bg={"pink.300"}
                    >
                      Avg. RQM Scores
                    </Th>
                  </Tr>
                </Thead>

                <Tbody
                  marginTop={"20px"}
                  className="Entries"
                >
                  {leaders.length > 0 &&
                    leaders.map((leader, index) => {
                      return (
                        <Tr
                          height={"80px"}
                          key={leader._id}
                          onClick={() => {
                            window.location.href = `/profile/${leader.inGameName}`;
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
                          <Td textAlign="center">{leader.name}</Td>
                          <Td textAlign="center">{leader.inGameName}</Td>
                          <Td textAlign="center">{leader.IQ_score}</Td>
                          <Td textAlign="center">{leader.quizSubmissions}</Td>
                          <Td textAlign="center">{leader.RQM_avg}</Td>
                        </Tr>
                      );
                    })}
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

const stepsLeaderBoard = [
  {
    id: "introduction",
    attachTo: { element: ".leaderboard", on: "bottom" },
    title: "Welcome to Leaderboard",
    text: "This is where the champions stand out! Click 'Next' to explore more.",
    buttons: [{ text: "Next", type: "next" }],
    classes: "custom-class-name-1",
    cancelIcon: {
      enabled: false,
    },
  },
  {
    id: "exploring-table",
    attachTo: { element: ".mainBoard", on: "top" },
    title: "Exploring the Leaderboard Table",
    text: "Here you can see the details of the top performers. Take a look and understand the columns.",
    buttons: [
      { text: "Back", type: "back" },
      { text: "Next", type: "next" },
    ],
    classes: "custom-class-name-2",
    cancelIcon: {
      enabled: false,
    },
    when: {
      show: () => {
        const mainBoard = document.querySelector(".mainBoard");
        console.log(mainBoard);
        mainBoard.classList.add("highlighted-card-1");
        const img = document.createElement("img");
        img.src = "../../images/click.png"; // Replace with your image path
        img.alt = "Hand Click Sign";
        img.classList.add("hand-click-img-leaderboard");
        mainBoard.appendChild(img);
        document
          .querySelector(".leaderboard")
          ?.classList.remove("shepherd-active");
      },
      hide: () => {
        document
          .querySelector(".leaderboard")
          ?.classList.add("shepherd-active");
        const mainBoard = document.querySelector(".mainBoard");
        mainBoard.classList.remove("highlighted-card-1");
        const img = document.querySelector(".hand-click-img-leaderboard");
        if (img) {
          img.remove();
        }
      },
    },
  },
  {
    id: "understanding-entry",
    attachTo: { element: ".mainBoard", on: "top" },
    title: "Understanding Leaderboard Entries",
    text: "Each row represents a user with their respective stats. Click 'Exit' to end the tour.",
    buttons: [{ text: "Exit", type: "cancel" }],
    classes: "custom-class-name-2",
    cancelIcon: {
      enabled: false,
    },
    when: {
      show: () => {
        const mainBoard = document.querySelector(".Entries");
        console.log(mainBoard);
        mainBoard.classList.add("highlighted-card-1");

        const img1 = document.createElement("img");
        img1.src = "../../images/click.png"; // Replace with your image path
        img1.alt = "Hand Click Sign";
        img1.classList.add("hand-click-img-rank-1");
        mainBoard.appendChild(img1);

        const img2 = document.createElement("img");
        img2.src = "../../images/click.png"; // Replace with your image path
        img2.alt = "Hand Click Sign";
        img2.classList.add("hand-click-img-rank-2");
        mainBoard.appendChild(img2);

        const img3 = document.createElement("img");
        img3.src = "../../images/click.png"; // Replace with your image path
        img3.alt = "Hand Click Sign";
        img3.classList.add("hand-click-img-rank-3");
        mainBoard.appendChild(img3);

        document.querySelector(".Entries")?.classList.remove("shepherd-active");
      },
      hide: () => {
        document.querySelector(".Entries")?.classList.add("shepherd-active");
        const mainBoard = document.querySelector(".mainBoard");
        mainBoard.classList.remove("highlighted-card-1");
        const img1 = document.querySelector(".hand-click-img-rank-1");
        if (img1) {
          img1.remove();
        }
        const img2 = document.querySelector(".hand-click-img-rank-2");
        if (img2) {
          img1.remove();
        }
        const img3 = document.querySelector(".hand-click-img-rank-3");
        if (img3) {
          img1.remove();
        }
      },
    },
  },
];

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
  },
  useModalOverlay: true,
};
