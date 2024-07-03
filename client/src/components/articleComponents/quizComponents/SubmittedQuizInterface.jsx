import React, { useEffect, useState } from "react";
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

const getReviewText = (field, value) => {
  const reviews = {
    score: {
      0: "Needs improvement",
      20: "Below average",
      40: "Average",
      60: "Good job",
      80: "Great work",
      100: "Excellent",
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
    rqmscore: {
      low: "Try harder",
      medium: "Good effort",
      high: "Outstanding",
    },
  };
  const reviewKeys = Object.keys(reviews[field])
    .map(Number)
    .sort((a, b) => a - b);

  for (let i = 0; i < reviewKeys.length; i++) {
    if (value <= reviewKeys[i]) {
      return reviews[field][reviewKeys[i]];
    }
  }

  if (field === "timeTaken") {
    if (value >= 33 && value < 50) return reviews.timeTaken.slow;
    if (value <= 16 && value > 33) return reviews.timeTaken.average;
    if (value >= 0 && value < 16) return reviews.timeTaken.fast;
  }
  if (field === "difficulty") {
    return reviews.difficulty[value] || "Keep going!";
  }
  if (field === "result?.RQM_score") {
    if (value < 45) return reviews.result?.RQM_score.low;
    if (value >= 45 && value < 75) return reviews.result?.RQM_score.medium;
    return reviews.result?.RQM_score.high;
  }
};

const SubmittedQuizInterface = ({
  isOpen = true,
  submitLoad = false,
  result,
}) => {
  const [scoreArr, setScoreArr] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const [labels, setLabels] = useState([]);
  // console.log(result);
  useEffect(() => {
    if (result?.score && result?.score.includes("/")) {
      setScoreArr(() => {
        const arr = result?.score.split("/");
        arr[0] = parseInt(arr[0]);
        arr[1] = parseInt(arr[1]);
        return arr;
      });
    }
    if (result.pastRQMs && result.pastRQMs.length > 0) {
      setQuizData(result.pastRQMs);
      setLabels(() => {
        const labels = Array.from(
          { length: result.pastRQMs.length - 1 },
          (_, i) => `Quiz ${i + 1}`
        );
        labels.push("Current Quiz");
        return labels;
      });
    }
  }, [submitLoad, result?.score, result?.pastRQMs]);

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
      <Box textAlign="center" py={8} px={0} borderRadius="md">
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
          <>
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
                    <StatNumber color="#3E3232">{result?.score}</StatNumber>
                    <StatHelpText color="#3E3232">
                      {getReviewText(
                        "score",
                        (scoreArr[0] / scoreArr[1]) * 100
                      )}
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel color="#3E3232" mt={5}>
                      Time Taken
                    </StatLabel>
                    <StatNumber color="#3E3232">
                      {result?.timeTaken} Sec
                    </StatNumber>
                    <StatHelpText color="#3E3232">
                      {getReviewText("timeTaken", result?.timeTaken)}
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
                    <StatNumber color="#3E3232">
                      {result?.articleDifficulty}
                    </StatNumber>
                    <StatHelpText color="#3E3232">
                      {getReviewText("difficulty", result?.articleDifficulty)}
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel color="#3E3232" mt={5}>
                      RQM Score
                    </StatLabel>
                    <StatNumber color="#3E3232">{result?.RQM_score}</StatNumber>
                    <StatHelpText color="#3E3232">
                      {getReviewText("rqmscore", result?.RQM_score)}
                    </StatHelpText>
                  </Stat>
                </Flex>
              </Flex>
            </StatGroup>
            <Box>
              <Flex flexDirection={"column"}>
                <HStack
                  spacing={0}
                  justifyContent={"center"}
                  mb={4}
                  w={"100%"}
                  mt={4}
                >
                  <Flex
                    flexDirection={"column"}
                    alignItems={"center"}
                    w={"100%"}
                  >
                    <Text color="#3E3232" fontSize="xs" fontWeight={"bold"}>
                      Rookie
                    </Text>
                    <Box
                      h={"20px"}
                      w={"100%"}
                      bg="gray.300"
                      zIndex={
                        result?.RQM_score >= 0 && result?.RQM_score < 15 ? 1 : 0
                      }
                      boxShadow={
                        result?.RQM_score >= 0 && result?.RQM_score < 15
                          ? "0 0 10px 2px #00f"
                          : "none"
                      }
                    ></Box>
                  </Flex>
                  <Flex
                    flexDirection={"column"}
                    alignItems={"center"}
                    w={"100%"}
                  >
                    <Text color="#3E3232" fontSize="xs" fontWeight={"bold"}>
                      Amateur
                    </Text>
                    <Box
                      h={"20px"}
                      w={"100%"}
                      bg="blue.400"
                      zIndex={
                        result?.RQM_score >= 15 && result?.RQM_score < 45
                          ? 0
                          : 1
                      }
                      boxShadow={
                        result?.RQM_score >= 15 && result?.RQM_score < 45
                          ? "0 0 10px 2px #00f"
                          : "none"
                      }
                    ></Box>
                  </Flex>
                  <Flex
                    flexDirection={"column"}
                    alignItems={"center"}
                    w={"100%"}
                  >
                    <Text color="#3E3232" fontSize="xs" fontWeight={"bold"}>
                      Advanced
                    </Text>
                    <Box
                      h={"20px"}
                      w={"100%"}
                      bg="green.500"
                      zIndex={
                        result?.RQM_score >= 45 && result?.RQM_score < 75
                          ? 1
                          : 0
                      }
                      boxShadow={
                        result?.RQM_score >= 45 && result?.RQM_score < 75
                          ? "0 0 10px 2px #00f"
                          : "none"
                      }
                    ></Box>
                  </Flex>
                  <Flex
                    flexDirection={"column"}
                    alignItems={"center"}
                    w={"100%"}
                  >
                    <Text color="#3E3232" fontSize="xs" fontWeight={"bold"}>
                      Expert
                    </Text>
                    <Box
                      h={"20px"}
                      w={"100%"}
                      bg="yellow.500"
                      zIndex={
                        result?.RQM_score >= 75 && result?.RQM_score < 105
                          ? 1
                          : 0
                      }
                      boxShadow={
                        result?.RQM_score >= 75 && result?.RQM_score < 105
                          ? "0 0 10px 2px #00f"
                          : "none"
                      }
                    ></Box>
                  </Flex>
                  <Flex
                    flexDirection={"column"}
                    alignItems={"center"}
                    w={"100%"}
                  >
                    <Text color="#3E3232" fontSize="xs" fontWeight={"bold"}>
                      Maestro
                    </Text>
                    <Box
                      h={"20px"}
                      w={"100%"}
                      bg="red.500"
                      zIndex={result?.RQM_score >= 105 ? 1 : 0}
                      boxShadow={
                        result?.RQM_score >= 105
                          ? "0 0 20px 10px #00ffe2"
                          : "none"
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
                    Today's RQM Score Update
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
          </>
        )}
      </Box>
    </SlideFade>
  );
};

export default SubmittedQuizInterface;
