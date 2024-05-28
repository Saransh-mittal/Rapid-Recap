import React, { useRef } from "react";
import { Box } from "@chakra-ui/react";
import PeopleReviews from "../components/getStartedComponents/peopleReviewSection"; // Importing the PeopleReviews component
import WhyToUseSection from "../components/getStartedComponents/whyToUseSection";
import HeroSection from "../components/getStartedComponents/heroSection";
import FooterSection from "../components/getStartedComponents/footerSection";
import CommingSoonSection from "../components/getStartedComponents/commingSoonSection";

const GetStarted = () => {
  return (
    <Box mt={{ base: "4rem", lg: "6.85rem" }}>
      {/* <Section
        className="pt-[12rem] -mt-[5.25rem]"
        crosses
        crossesOffset="lg:translate-y-[5.25rem]"
        customPaddings
        id="hero"
      >
        <Box
          className="container relative"
          position="relative"
          textAlign="center"
          maxW="container.xl"
          mx="auto"
          ref={parallaxRef}
        >
          <Box
            maxW="62rem"
            mx="auto"
            mb={{ base: "3.875rem", md: "5rem", lg: "6.25rem" }}
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
      </Section> */}
      <HeroSection />
      <WhyToUseSection />
      <PeopleReviews />
      <CommingSoonSection />
      <FooterSection />
    </Box>
  );
};

export default GetStarted;
