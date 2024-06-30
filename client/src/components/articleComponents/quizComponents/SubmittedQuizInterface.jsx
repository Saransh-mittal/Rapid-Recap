import React from "react";
import {
  Text,
  SlideFade,
  Box,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  HStack,
  keyframes,
} from "@chakra-ui/react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Heading from "../../miscellaneous/HeadingComponent";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const heartbeat = keyframes`
  0%, 100% {
    transform: scale(1.1);
  }
  // 25% {
  //   transform: scale(1.1);
  // }
  50% {
    transform: scale(1.2);
  }
  // 75% {
  //   transform: scale(1.1);
  // }
`;

const getReviewText = (field, value) => {
  const reviews = {
    score: {
      1: "Needs improvement",
      2: "Below average",
      3: "Good job",
      4: "Great work",
      5: "Excellent",
    },
    timeTaken: {
      slow: "Too slow",
      average: "Decent speed",
      fast: "Very quick",
    },
    difficulty: {
      Easy: "Keep practicing!",
      Medium: "Well done!",
      Hard: "Impressive!",
    },
    rqmScore: {
      low: "Try harder",
      medium: "Good effort",
      high: "Outstanding",
    },
  };

  if (field === "score") {
    return reviews.score[value] || "Good effort";
  }
  if (field === "timeTaken") {
    if (value >= 33 && value < 50) return reviews.timeTaken.slow;
    if (value <= 16 && value > 33) return reviews.timeTaken.average;
    if (value >= 0 && value < 16) return reviews.timeTaken.fast;
  }
  if (field === "difficulty") {
    return reviews.difficulty[value] || "Keep going!";
  }
  if (field === "rqmScore") {
    if (value < 45) return reviews.rqmScore.low;
    if (value >= 45 && value < 75) return reviews.rqmScore.medium;
    return reviews.rqmScore.high;
  }
};

const SubmittedQuizInterface = ({
  score = 5,
  isOpen = true,
  submitLoad = false,
  timeTaken = 0,
  difficulty = "Easy",
  rqmScore = 111,
}) => {
  const quizData = [11, 32, 55, 88, 105, rqmScore]; // Including the current quiz's RQM score
  const labels = [
    "Quiz 1",
    "Quiz 2",
    "Quiz 3",
    "Quiz 4",
    "Quiz 5",
    "Current Quiz",
  ]; // Adding a label for the current quiz

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "RQM Score",
        data: quizData,
        fill: false,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        pointStyle: "circle",
        pointRadius: 5,
        pointBorderColor: "#009FBD",
        pointBorderWidth: 2,
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#3E3232", // Dark color for the y-axis text
          font: {
            weight: "bold", // Bold text
          },
        },
      },
      x: {
        ticks: {
          color: "#3E3232", // Dark color for the x-axis text
          font: {
            weight: "bold", // Bold text
          },
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#3E3232", // Dark color for the legend text
          font: {
            weight: "bold", // Bold text
          },
        },
      },
    },
  };

  return (
    <SlideFade direction="bottom" in={isOpen} offsetY="20px">
      <Box textAlign="center" py={8} px={0} borderRadius="md" mt={8}>
        <Flex flexWrap={"wrap"} px={"2rem"}>
          <Heading
            title={"Quiz Completed Successfully!!"}
            headingWeight="bold"
          />
        </Flex>
        {submitLoad ? (
          <Text color="#3E3232" fontSize="30px" textAlign="center" mb={4}>
            Calculating...
          </Text>
        ) : (
          //make a condition that if the screen is smaller than 768px

          <StatGroup
            border={{ base: "1px solid black", md: "none" }}
            borderRadius={"xl"}
          >
            <Flex w={"100%"}>
              <Flex
                justifyContent={"space-between"}
                w={"100%"}
                flexDirection={{ base: "column", md: "row" }}
              >
                <Stat borderBottom={{ base: "1px solid black", md: "none" }}>
                  <StatLabel color="#3E3232" mt={5}>
                    Score
                  </StatLabel>
                  <StatNumber color="#3E3232">{score} / 5</StatNumber>
                  <StatHelpText color="#3E3232">
                    {getReviewText("score", score)}
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel color="#3E3232" mt={5}>
                    Time Taken
                  </StatLabel>
                  <StatNumber color="#3E3232">{timeTaken} seconds</StatNumber>
                  <StatHelpText color="#3E3232">
                    {getReviewText("timeTaken", timeTaken)}
                  </StatHelpText>
                </Stat>
              </Flex>

              <Flex
                border={{ base: "1px solid black", md: "none" }}
                display={{ base: "black", md: "none" }}
                width={"0%"}
              />
              <Flex
                justifyContent={"space-between"}
                w={"100%"}
                flexDirection={{ base: "column", md: "row" }}
              >
                <Stat borderBottom={{ base: "1px solid black", md: "none" }}>
                  <StatLabel color="#3E3232" mt={5}>
                    Article Difficulty
                  </StatLabel>
                  <StatNumber color="#3E3232">{difficulty}</StatNumber>
                  <StatHelpText color="#3E3232">
                    {getReviewText("difficulty", difficulty)}
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel color="#3E3232" mt={5}>
                    RQM Score
                  </StatLabel>
                  <StatNumber color="#3E3232">{rqmScore}</StatNumber>
                  <StatHelpText color="#3E3232">
                    {getReviewText("rqmScore", rqmScore)}
                  </StatHelpText>
                </Stat>
              </Flex>
            </Flex>
          </StatGroup>
        )}

        {!submitLoad && (
          <Box>
            <Flex flexDirection={"column"}>
              <HStack
                spacing={0}
                justifyContent={"center"}
                mb={4}
                w={"100%"}
                mt={4}
              >
                <Flex flexDirection={"column"} alignItems={"center"} w={"100%"}>
                  <Text color="#3E3232" fontSize="xs" fontWeight={"bold"}>
                    Rookie
                  </Text>
                  <Box
                    h={"20px"}
                    w={"100%"}
                    bg="gray.300"
                    animation={
                      rqmScore >= 0 && rqmScore < 15
                        ? `${heartbeat} 1.5s infinite`
                        : "none"
                    }
                    boxShadow={
                      rqmScore >= 0 && rqmScore < 15
                        ? "0 0 10px 2px #00f"
                        : "none"
                    }
                  ></Box>
                </Flex>
                <Flex flexDirection={"column"} alignItems={"center"} w={"100%"}>
                  <Text color="#3E3232" fontSize="xs" fontWeight={"bold"}>
                    Amateur
                  </Text>
                  <Box
                    h={"20px"}
                    w={"100%"}
                    bg="blue.400"
                    animation={
                      rqmScore >= 15 && rqmScore < 45
                        ? `${heartbeat} 1.5s infinite`
                        : "none"
                    }
                    boxShadow={
                      rqmScore >= 15 && rqmScore < 45
                        ? "0 0 10px 2px #00f"
                        : "none"
                    }
                  ></Box>
                </Flex>
                <Flex flexDirection={"column"} alignItems={"center"} w={"100%"}>
                  <Text color="#3E3232" fontSize="xs" fontWeight={"bold"}>
                    Advanced
                  </Text>
                  <Box
                    h={"20px"}
                    w={"100%"}
                    bg="green.500"
                    animation={
                      rqmScore >= 45 && rqmScore < 75
                        ? `${heartbeat} 1.5s infinite`
                        : "none"
                    }
                    boxShadow={
                      rqmScore >= 45 && rqmScore < 75
                        ? "0 0 10px 2px #00f"
                        : "none"
                    }
                  ></Box>
                </Flex>
                <Flex flexDirection={"column"} alignItems={"center"} w={"100%"}>
                  <Text color="#3E3232" fontSize="xs" fontWeight={"bold"}>
                    Expert
                  </Text>
                  <Box
                    h={"20px"}
                    w={"100%"}
                    bg="yellow.500"
                    animation={
                      rqmScore >= 75 && rqmScore < 105
                        ? `${heartbeat} 1.5s infinite`
                        : "none"
                    }
                    boxShadow={
                      rqmScore >= 75 && rqmScore < 105
                        ? "0 0 10px 2px #00f"
                        : "none"
                    }
                  ></Box>
                </Flex>
                <Flex flexDirection={"column"} alignItems={"center"} w={"100%"}>
                  <Text color="#3E3232" fontSize="xs" fontWeight={"bold"}>
                    Maestro
                  </Text>
                  <Box
                    h={"20px"}
                    w={"100%"}
                    bg="red.500"
                    // animation={
                    //   rqmScore >= 105 ? `${heartbeat} 2.5s infinite` : "none"
                    // }
                    boxShadow={
                      rqmScore >= 105 ? "0 0 20px 10px #00ffe2" : "none"
                    }
                  />
                </Flex>
              </HStack>
              <HStack gap={0}>
                <Flex
                  w={"100%"}
                  textAlign={"center"}
                  h="20px"
                  position={"relative"}
                >
                  <Text position={"absolute"} left={"-3px"}>
                    0
                  </Text>
                </Flex>
                <Flex
                  w={"100%"}
                  textAlign={"center"}
                  h="20px"
                  position={"relative"}
                >
                  <Text position={"absolute"} left={"-3px"}>
                    15
                  </Text>
                </Flex>
                <Flex
                  w={"100%"}
                  textAlign={"center"}
                  h="20px"
                  position={"relative"}
                >
                  <Text position={"absolute"} left={"-3px"}>
                    45
                  </Text>
                </Flex>
                <Flex
                  w={"100%"}
                  textAlign={"center"}
                  h="20px"
                  position={"relative"}
                >
                  <Text position={"absolute"} left={"-3px"}>
                    75
                  </Text>
                </Flex>
                <Flex
                  w={"100%"}
                  textAlign={"center"}
                  h="20px"
                  position={"relative"}
                >
                  <Text position={"absolute"} left={"-3px"}>
                    105
                  </Text>
                  <Text
                    position={"absolute"}
                    right={"-3px"}
                    letterSpacing={"3px"}
                  >
                    ...
                  </Text>
                </Flex>
              </HStack>
            </Flex>
            <Flex
              flexDirection={"column"}
              // justifyContent={"center"}
              alignItems={"center"}
              height={"300px"}
            >
              <Flex justifyContent={"center"} mt={4}>
                <Text
                  color="#3E3232"
                  fontSize="20px"
                  textAlign="center"
                  my={4}
                  fontWeight={"bold"}
                  textTransform={"uppercase"}
                >
                  RQM Score Progress
                </Text>
              </Flex>

              <Flex
                width="100%"
                height={"100%"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Line data={chartData} options={chartOptions} />
              </Flex>
            </Flex>
          </Box>
        )}
      </Box>
    </SlideFade>
  );
};

export default SubmittedQuizInterface;
