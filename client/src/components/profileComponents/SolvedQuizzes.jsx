import {
  Box,
  Flex,
  Progress,
  Stack,
  Tag,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import React, { useContext, useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import Loading from "../miscellaneous/Loading";
import SolvedQuizHistory from "./SolvedQuizSubComponents/SolvedQuizHistory";
import { AppContext } from "../../contextAPI/appContext";

const SolvedQuizzes = ({
  solvedQuizzes,
  inGameName,
  privateSolvedQuiz,
  loginedUserProfile,
}) => {
  const { state } = useContext(AppContext);
  const toast = useToast();
  const [solvedQuizzesCount, setSolvedQuizzesCount] = useState(0);
  const [easySolved, setEasySolved] = useState(0);
  const [mediumSolved, setMediumSolved] = useState(0);
  const [hardSolved, setHardSolved] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const fetchSolvedQuizzes = async () => {
    try {
      //const response = await axios.get("/api/user/solvedQuizzesCount");
      const data = solvedQuizzes;
      setSolvedQuizzesCount(data.solvedQuizzesCount);
      setEasySolved(data.easy);
      setMediumSolved(data.medium);
      setHardSolved(data.hard);
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: "Unable to get Solved Quiz Data. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHistory = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/user/solvedQuizzesHistory?inGameName=${inGameName}`
      );
      setHistory(response.data);
      setShowHistory(true);
    } catch (error) {
      toast({
        title: "An error occurred.",
        description:
          "Unable to get Solved Quiz History. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchSolvedQuizzes();
  }, [solvedQuizzes]);
  return (
    <Flex
      margin="10px"
      borderRadius="10px"
      w={"100%"}
      flexDirection={"column"}
      gap={6}
      mt={4}
      mr={10}
      onClick={!privateSolvedQuiz ? getHistory : null}
    >
      {showHistory && (
        <SolvedQuizHistory
          solvedHistory={history}
          setShowHistory={setShowHistory}
        />
      )}
      {privateSolvedQuiz ? (
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
          <Box
            flexDirection={"column"}
            width={"100%"}
            marginStart={"15px"}
            position={"relative"}
          >
            <Text textAlign={"left"} color={"#9CAFAA"} p={0} m={0}>
              Solved Quizzes
            </Text>
            {loginedUserProfile && (
              <Tooltip label="Visibility to others">
                <Tag
                  backgroundColor="#0f0d15"
                  m={0}
                  position={"absolute"}
                  top={0}
                  right={0}
                  color={"#9CAFAA"}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  w={"60px"}
                  height={"30px"}
                >
                  {state.user.profilePrivacy.solvedQuizzes
                    ? "HIDDEN"
                    : "VISIBLE"}
                </Tag>
              </Tooltip>
            )}
          </Box>
          <Flex width={"100%"}>
            <Flex w={"80%"} justifyContent={"center"} alignItems={"center"}>
              <Flex
                borderWidth={"5px"}
                borderRadius={"50%"}
                borderColor={"#FFE7E7"}
                w={"100px"}
                h={"100px"}
              >
                <Flex
                  width={"100%"}
                  justifyContent={"center"}
                  flexDirection={"column"}
                  alignItems={"center"}
                >
                  <Text
                    m={0}
                    p={0}
                    fontSize={"1.5rem"}
                    marginTop={"2px"}
                    fontWeight={"semibold"}
                    color={"#B47B84"}
                  >
                    {solvedQuizzesCount}
                  </Text>
                  <Text
                    marginBottom={0}
                    marginTop={"1px"}
                    color={"#B47B84"}
                    fontWeight={"light"}
                    fontSize={"0.9rem"}
                  >
                    Solved
                  </Text>
                </Flex>
              </Flex>
            </Flex>
            <Flex
              w={"100%"}
              paddingLeft={1}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Stack spacing={5} w={"100%"}>
                <Box>
                  <Flex justifyContent={"space-between"} marginBottom={"5px"}>
                    <Text
                      marginBottom={0}
                      marginTop={"1px"}
                      color={"#FFE7E7"}
                      fontWeight={"light"}
                      fontSize={"0.8rem"}
                      textAlign={"left"}
                    >
                      Easy
                    </Text>
                    <Text
                      marginBottom={0}
                      marginTop={"1px"}
                      color={"#FFE7E7"}
                      fontWeight={"light"}
                      fontSize={"0.8rem"}
                      textAlign={"left"}
                    >
                      {easySolved.easyQuizzesCount} Solved
                    </Text>
                    <Text
                      marginBottom={0}
                      marginTop={"1px"}
                      color={"#FFE7E7"}
                      fontWeight={"light"}
                      fontSize={"0.8rem"}
                      textAlign={"left"}
                    >
                      Beats {Math.round(easySolved.easyBeatsPercentage)}%
                    </Text>
                  </Flex>
                  <Progress
                    backgroundColor={"#AAD9BB"}
                    colorScheme="teal"
                    size="sm"
                    value={Math.round(easySolved.easyBeatsPercentage)}
                    borderRadius={"5px"}
                  />
                </Box>
                <Box>
                  <Flex justifyContent={"space-between"} marginBottom={"5px"}>
                    <Text
                      textAlign={"left"}
                      marginBottom={0}
                      marginTop={"1px"}
                      color={"#FFE7E7"}
                      fontWeight={"light"}
                      fontSize={"0.8rem"}
                    >
                      Medium
                    </Text>
                    <Text
                      marginBottom={0}
                      marginTop={"1px"}
                      color={"#FFE7E7"}
                      fontWeight={"light"}
                      fontSize={"0.8rem"}
                      textAlign={"left"}
                    >
                      {mediumSolved.mediumQuizzesCount} Solved
                    </Text>
                    <Text
                      marginBottom={0}
                      marginTop={"1px"}
                      color={"#FFE7E7"}
                      fontWeight={"light"}
                      fontSize={"0.8rem"}
                      textAlign={"left"}
                    >
                      Beats {Math.round(mediumSolved.medBeatsPercentage)}%
                    </Text>
                  </Flex>
                  <Progress
                    colorScheme="yellow"
                    size="sm"
                    value={Math.round(mediumSolved.medBeatsPercentage)}
                    borderRadius={"5px"}
                    backgroundColor={"#FFCF81"}
                  />
                </Box>
                <Box>
                  <Flex justifyContent={"space-between"} marginBottom={"5px"}>
                    <Text
                      textAlign={"left"}
                      marginBottom={0}
                      marginTop={"1px"}
                      color={"#FFE7E7"}
                      fontWeight={"light"}
                      fontSize={"0.8rem"}
                    >
                      Hard
                    </Text>
                    <Text
                      marginBottom={0}
                      marginTop={"1px"}
                      color={"#FFE7E7"}
                      fontWeight={"light"}
                      fontSize={"0.8rem"}
                      textAlign={"left"}
                    >
                      {hardSolved.hardQuizzesCount} Solved
                    </Text>
                    <Text
                      marginBottom={0}
                      marginTop={"1px"}
                      color={"#FFE7E7"}
                      fontWeight={"light"}
                      fontSize={"0.8rem"}
                      textAlign={"left"}
                    >
                      Beats {Math.round(hardSolved.hardBeatsPercentage)}%
                    </Text>
                  </Flex>
                  <Progress
                    backgroundColor={"#D37676"}
                    colorScheme="red"
                    size="sm"
                    value={Math.round(hardSolved.hardBeatsPercentage)}
                    borderRadius={"5px"}
                  />
                </Box>
              </Stack>
            </Flex>
          </Flex>
        </>
      )}
    </Flex>
  );
};

export default SolvedQuizzes;
