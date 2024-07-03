import React from "react";
import { Box, Image, Text } from "@chakra-ui/react";
import { findSocietyAndCircle } from "../../../utils/helper.utils";

const IQScore = ({ score }) => {
  const society = findSocietyAndCircle(score).image;
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="rgba(255, 255, 255, 0.1)"
      borderRadius="full"
      p="0.5rem"
      // cursor="pointer"
      transition="all 0.3s"
      _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
      title="Your Information Quotient (IQ) Score"
      border="2px solid #00ffff"
      boxShadow="0 0 1px #00ffff"
      width={"105px"}
      h={"40px"}
      gap={1}
    >
      <Text fontSize="1.1rem" fontWeight="bold" color="white" m={0} p={0}>
        IQ: {score}
      </Text>
      <Image src={society} h={"25px"} w={"25px"} />
    </Box>
  );
};

export default IQScore;
