import { Box, Heading } from "@chakra-ui/react";
import React, { useRef } from "react";
import Section from "../miscellaneous/Section";

const CommigSoonSection = () => {
  const parallaxRef = useRef(null);
  return (
    <Section crosses customPaddings={`2.85rem 0 0 0`} id="whyUse">
      <Box
        mb={"2rem"}
        textAlign="center"
        maxW="62rem"
        mx="auto"
        ref={parallaxRef}
      >
        <Heading as="h2" size="lg" mb={4} textAlign="center">
          Coming Soon.....
        </Heading>
        <Box>
          <Heading as="h3" size="md" mb={2}>
            Exciting Features Await!
          </Heading>
          <Box textAlign="left">
            <ul>
              <li>Personalized quiz experience</li>
              <li>Interactive news feed</li>
              <li>Real-time IQ tracking</li>
              <li>Engaging leaderboards</li>
            </ul>
          </Box>
        </Box>
      </Box>
    </Section>
  );
};

export default CommigSoonSection;
