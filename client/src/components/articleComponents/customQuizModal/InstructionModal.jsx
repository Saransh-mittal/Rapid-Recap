// InstructionModal.js
import React from "react";
import { ModalBody, Heading, Text, VStack, Box } from "@chakra-ui/react";

const InstructionModal = () => {
  return (
    <>
      <ModalBody
        p={"15px"}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        width={"100%"}
        color={"black"}
        
      >
        <Heading as="h1" size={"xl"} mb={2}>
          Instructions
        </Heading>

        <VStack spacing={1} alignItems="start" textAlign="left">
        <Box mt={5} mb={-1}>
            <Text fontStyle={"italic"} fontWeight={"bold"}> * Read all the instructions carefully before attempting the quiz</Text>
          </Box>
          <Box mt={-1} mb={-1}>
            <Text>1. Quiz will contain five questions.</Text>
          </Box>
          <Box mt={-1} mb={-1}>
            <Text>2. All the questions will be from the given article only.</Text>
          </Box>
          <Box mt={-1} mb={-1}>
            <Text>3. All questions are compulsory to attempt.</Text>
          </Box>
          <Box mt={-1} mb={-1}>
            <Text>
              4. At last, you will get your score and your percentile.
            </Text>
          </Box>
          <Box mt={-1} mb={-1}>
            <Text>5. You can't leave the quiz in between.</Text>
          </Box>
          <Box mt={-1}>
            <Text>6. Attempting the quiz will affect your IQ score.</Text>
          </Box>
        </VStack> 
      </ModalBody>
    </>
  );
};

export default InstructionModal;
