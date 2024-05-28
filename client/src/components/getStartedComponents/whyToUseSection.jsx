import React from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";

const WhyToUseSection = () => {
  const textColor = useColorModeValue("gray.700", "gray.200");

  return (
    <Box mb={8} p={5} borderRadius="md" shadow="md">
      <Heading as="h2" size="lg" mb={4} textAlign="center">
        Why Use It?
      </Heading>
      <VStack spacing={4} align="start">
        <Box display="flex" alignItems="center">
          <Icon as={FaCheckCircle} color="green.500" w={6} h={6} mr={2} />
          <Text color={textColor}>
            <strong>User-Friendly Interface:</strong> Designed with ease of use
            in mind, ensuring a smooth user experience.
          </Text>
        </Box>
        <Box display="flex" alignItems="center">
          <Icon as={FaCheckCircle} color="green.500" w={6} h={6} mr={2} />
          <Text color={textColor}>
            <strong>Highly Customizable:</strong> Easily customizable to fit
            your needs, with extensive styling options.
          </Text>
        </Box>
        <Box display="flex" alignItems="center">
          <Icon as={FaCheckCircle} color="green.500" w={6} h={6} mr={2} />
          <Text color={textColor}>
            <strong>Responsive Design:</strong> Optimized for all screen sizes,
            providing a seamless experience on any device.
          </Text>
        </Box>
        <Box display="flex" alignItems="center">
          <Icon as={FaCheckCircle} color="green.500" w={6} h={6} mr={2} />
          <Text color={textColor}>
            <strong>Extensive Documentation:</strong> Comes with comprehensive
            documentation to help you get started quickly.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default WhyToUseSection;
