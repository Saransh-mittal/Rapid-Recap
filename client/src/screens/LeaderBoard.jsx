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
import React, { useEffect, useState } from "react";
import medalIcon from "../assets/medal.png";
import axios from "axios";
import Loading from "../components/miscellaneous/Loading";

const LeaderBoard = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [leaders, setLeaders] = useState(null);

  const fetchLearderBoard = async () => {
    try {
      const response = await axios.get("/api/user/leaderboard");
      //console.log(response.data.users);
      setLeaders(() => response.data.users);
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
    fetchLearderBoard();
  }, []);
  return (
    <Flex minH={"85vh"} justifyContent={"center"}>
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
            <TableContainer width={"100%"}>
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

                <Tbody marginTop={"20px"}>
                  {leaders.length > 0 &&
                    leaders.map((leader, index) => {
                      return (
                        <Tr height={"80px"} key={leader._id}>
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
