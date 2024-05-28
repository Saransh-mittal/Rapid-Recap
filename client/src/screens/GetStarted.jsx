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
      <HeroSection />
      <WhyToUseSection />
      <PeopleReviews />
      <CommingSoonSection />
      <FooterSection />
    </Box>
  );
};

export default GetStarted;
