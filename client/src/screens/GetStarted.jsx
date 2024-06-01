import React, { useRef } from "react";
import { Box, Flex } from "@chakra-ui/react";
import PeopleReviews from "../components/getStartedComponents/peopleReviewSection"; // Importing the PeopleReviews component
import WhyToUseSection from "../components/getStartedComponents/whyToUseSection";
import HeroSection from "../components/getStartedComponents/heroSection";
import FooterSection from "../components/getStartedComponents/footerSection";
import CommingSoonSection from "../components/getStartedComponents/commingSoonSection";

const GetStarted = () => {
  return (
    <Flex mt={{ base: "4rem", lg: "6.85rem" }} flexDirection={"column"}>
      <HeroSection />
      <WhyToUseSection />
      <PeopleReviews />
      <CommingSoonSection />
      <FooterSection />
    </Flex>
  );
};

export default GetStarted;
