// InstructionModal.js
import React from "react";
import { ModalBody, Heading, Text, VStack, Box } from "@chakra-ui/react";

const HindiInstructionModal = () => {
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
          निर्देश
        </Heading>

        <VStack spacing={1} alignItems="start" textAlign="left">
          <Box mt={5} mb={-1}>
            <Text fontStyle={"italic"} fontWeight={"bold"}>
              {" "}
              * क्विज का प्रयास करने से पहले सभी निर्देशों को ध्यानपूर्वक पढ़ें
            </Text>
          </Box>
          <Box mt={-1} mb={-1}>
            <Text>1. क्विज में अधिकतम पाँच प्रश्न होंगे।</Text>
          </Box>
          <Box mt={-1} mb={-1}>
            <Text>2. सभी प्रश्न दिए गए लेख से ही होंगे।</Text>
          </Box>
          <Box mt={-1} mb={-1}>
            <Text>3. सभी प्रश्न को हल करना अनिवार्य है।</Text>
          </Box>
          <Box mt={-1} mb={-1}>
            <Text>4. अंत में, आपको अपना स्कोर और प्रतिशत प्राप्त होगा।</Text>
          </Box>
          <Box mt={-1} mb={-1}>
            <Text>5. आप क्विज को बीच में छोड़ नहीं सकते।</Text>
          </Box>
          <Box mt={-1}>
            <Text>
              6. क्विज का प्रयास करने से आपका आईक्यू स्कोर प्रभावित होगा।
            </Text>
          </Box>
        </VStack>
      </ModalBody>
    </>
  );
};

export default HindiInstructionModal;
