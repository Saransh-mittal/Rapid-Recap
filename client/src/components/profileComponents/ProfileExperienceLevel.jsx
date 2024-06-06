import React from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import { keyframes } from "@emotion/react";

const waveAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const MotionBox = motion(Box);

const ProfileExperienceLevel = ({ xp, level }) => {
  const progress = (xp / (level * 10)) * 100;

  return (
    <Box
      p={6}
      maxW="450px"
      borderWidth={1}
      borderRadius="md"
      overflow="hidden"
      bgColor="#0f0d15"
      bgImage="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
      color="white"
      boxShadow="0 4px 8px rgba(0, 0, 0, 0.4)"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Flex alignItems="center" mb={4}>
        <Icon as={FaStar} w={10} h={10} color="gold" />
        <Box ml={4}>
          <Heading as="h3" size="lg" fontWeight="bold" letterSpacing="wide">
            Level {level}
          </Heading>
        </Box>
      </Flex>
      <Text fontSize="xl" mb={3} fontWeight="medium">
        XP Progress
      </Text>
      <Box
        position="relative"
        width="100px"
        height="300px"
        borderRadius="15px"
        overflow="hidden"
        bg="rgba(255, 255, 255, 0.2)"
        border="2px solid white"
      >
        <MotionBox
          position="absolute"
          bottom="0"
          width="100%"
          height={`${progress}%`}
          bg="teal.400"
          borderRadius="inherit"
          initial={{ height: 0 }}
          animate={{ height: `${progress}%` }}
          transition={{ duration: 2, ease: "easeInOut" }}
          style={{ animation: `${waveAnimation} 4s ease-in-out infinite` }}
        >
          <Text
            position="absolute"
            right="0"
            left="0"
            bottom="50%"
            transform="translateY(50%)"
            textAlign="center"
            fontWeight="bold"
            fontSize="lg"
          >
            {xp} XP
          </Text>
        </MotionBox>
      </Box>
      <Flex
        justifyContent="space-between"
        fontSize="lg"
        fontWeight="medium"
        width="100%"
        mt={4}
      >
        <Text>Next Level: {level * 10} XP</Text>
        <Text>Current Level: {level}</Text>
      </Flex>
    </Box>
  );
};

export default ProfileExperienceLevel;
