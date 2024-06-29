import React from "react";
import {
  Text,
  SlideFade,
  Heading,
  Box,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  HStack,
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
      <Box textAlign="center" p={8} borderRadius="md" mt={8}>
        <Heading as="h3" size="lg" color="#3E3232" mb={8}>
          Quiz completed. Thank you for participating!
        </Heading>

        {submitLoad ? (
          <Text color="#3E3232" fontSize="30px" textAlign="center" mb={4}>
            Calculating...
          </Text>
        ) : (
          <StatGroup>
            <Stat>
              <StatLabel color="#3E3232">Score</StatLabel>
              <StatNumber color="#3E3232">{score} / 5</StatNumber>
              <StatHelpText color="#3E3232">Well done!</StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="#3E3232">Time Taken</StatLabel>
              <StatNumber color="#3E3232">{timeTaken} seconds</StatNumber>
              <StatHelpText color="#3E3232">Great speed!</StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="#3E3232">Article Difficulty</StatLabel>
              <StatNumber color="#3E3232">{difficulty}</StatNumber>
              <StatHelpText color="#3E3232">Keep practicing!</StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="#3E3232">RQM Score</StatLabel>
              <StatNumber color="#3E3232">{rqmScore}</StatNumber>
              <StatHelpText color="#3E3232">Reflects quality!</StatHelpText>
            </Stat>
          </StatGroup>
        )}

        {!submitLoad && (
          <Box mt={6}>
            <Text color="#3E3232" fontSize="20px" textAlign="center" mb={4}>
              RQM Score Progress
            </Text>
            <HStack spacing={0} justifyContent={"center"}>
              <Flex flexDirection={"column"} alignItems={"center"}>
                <Text color="#3E3232" fontSize="xs">
                  Rookie (0-15)
                </Text>
                <Box
                  w={rqmScore >= 0 && rqmScore < 15 ? "130px" : "120px"}
                  h={rqmScore >= 0 && rqmScore < 15 ? "30px" : "20px"}
                  bg="gray.300"
                ></Box>
              </Flex>
              <Flex flexDirection={"column"} alignItems={"center"}>
                <Text color="#3E3232" fontSize="xs">
                  Intermediate (15-45)
                </Text>
                <Box
                  w={rqmScore >= 15 && rqmScore < 45 ? "130px" : "120px"}
                  h={rqmScore >= 15 && rqmScore < 45 ? "30px" : "20px"}
                  bg="blue.400"
                ></Box>
              </Flex>
              <Flex flexDirection={"column"} alignItems={"center"}>
                <Text color="#3E3232" fontSize="xs">
                  Advanced (45-75)
                </Text>
                <Box
                  w={rqmScore >= 45 && rqmScore < 75 ? "130px" : "120px"}
                  h={rqmScore >= 45 && rqmScore < 75 ? "30px" : "20px"}
                  bg="green.500"
                ></Box>
              </Flex>
              <Flex flexDirection={"column"} alignItems={"center"}>
                <Text color="#3E3232" fontSize="xs">
                  Expert (75-105)
                </Text>
                <Box
                  w={rqmScore >= 75 && rqmScore < 105 ? "130px" : "120px"}
                  h={rqmScore >= 75 && rqmScore < 105 ? "30px" : "20px"}
                  bg="yellow.500"
                ></Box>
              </Flex>
              <Flex flexDirection={"column"} alignItems={"center"}>
                <Text color="#3E3232" fontSize="xs">
                  Quiz Maestro (105+)
                </Text>
                <Box
                  w={rqmScore >= 105 ? "130px" : "120px"}
                  h={rqmScore >= 105 ? "30px" : "20px"}
                  bg="red.500"
                ></Box>
              </Flex>
            </HStack>

            <Box width="100%" height="300px">
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Box>
        )}
      </Box>
    </SlideFade>
  );
};

export default SubmittedQuizInterface;
