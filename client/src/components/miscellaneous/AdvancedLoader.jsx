import React, { useState, useEffect } from "react";
import {
  Box,
  Spinner,
  Text,
  VStack,
  Progress,
  useColorModeValue,
} from "@chakra-ui/react";

const tips = [
  "Did you know? You can improve your IQ score by reading more articles!",
  "Tip: Check the leaderboard to see how you rank against other users.",
  "Fun fact: The average person spends 2 hours a day catching up on news.",
  "Tip: Try our daily quiz to boost your knowledge and IQ score!",
];

const AdvancedLoader = ({ message = "Loading Rapid Recap content..." }) => {
  const [progress, setProgress] = useState(0);
  const [tip, setTip] = useState(tips[0]);
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.200");

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 0;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 3000);

    return () => {
      clearInterval(tipTimer);
    };
  }, []);

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
    >
      <VStack spacing={4} width="80%" maxWidth="400px">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text
          fontSize="lg"
          fontWeight="medium"
          color={textColor}
          textAlign="center"
        >
          {message}
        </Text>
        <Progress width="100%" value={progress} size="sm" colorScheme="blue" />
        <Text fontSize="sm" color={textColor} textAlign="center">
          {tip}
        </Text>
      </VStack>
    </Box>
  );
};

export default AdvancedLoader;
