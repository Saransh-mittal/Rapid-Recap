import React, { useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Image,
  Flex,
  useBreakpointValue,
  Button,
} from "@chakra-ui/react";
import Section from "../miscellaneous/Section";
import curve from "../../assets/curve.png";

const heroSection = () => {
  const parallaxRef = useRef(null);
  const crossesOffset = useBreakpointValue({
    base: "translateY(0)",
    lg: "translateY(5.25rem)",
  });
  return (
    <Section crosses customPaddings={`2.85rem 0 0 0`} id="hero">
      <Box
        // className="container"
        position="relative"
        textAlign="center"
        maxW="container.xl"
        mx="auto"
        mb={"2rem"}
        ref={parallaxRef}
      >
        <Box
          maxW="62rem"
          // maxH={{ base: "auto", lg: "30rem" }}
          mx="auto"
          // mb={{ base: "3.875rem", md: "5rem", lg: "6.25rem" }}

          zIndex="1"
        >
          <Heading as="h1" size="2xl" mb="6">
            Explore the Potential of your brain with{" "}
            <Box as="span" display="inline-block" position="relative">
              Rapid Recap{" "}
              <Image
                src={curve}
                position="absolute"
                mt={{ base: "0.5rem", lg: "0.85rem" }}
                top="100%"
                left="0"
                background={{ base: "none", lg: "transparent" }}
                height={{ base: "0.5rem", lg: "0.75rem" }}
                width="full"
                transform="translateY(-0.5rem)"
                alt="Curve"
              />
            </Box>
          </Heading>
          <Text
            fontSize="lg"
            maxW="3xl"
            mx="auto"
            mb={{ base: "6", lg: "8" }}
            color="gray.600"
            mt={{ base: "0", lg: "2rem" }}
          >
            Unlock the potential of your intellect with Rapid Recap. Elevate
            your knowledge game with Rapid Recap, the ultimate news and quiz
            platform powered by AI.
          </Text>
          <Button as="a" href="/pricing" colorScheme="blue">
            Get started
          </Button>
        </Box>
      </Box>
    </Section>
  );
};

export default heroSection;
