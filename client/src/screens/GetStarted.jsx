import React from "react";
import { Box } from "@chakra-ui/react";
import PeopleReviews from "../components/getStartedComponents/peopleReviewSection"; // Importing the PeopleReviews component
import WhyToUseSection from "../components/getStartedComponents/whyToUseSection";
import QuoteSection from "../components/getStartedComponents/quoteSection";
import FooterSection from "../components/getStartedComponents/footerSection";
import CommingSoonSection from "../components/getStartedComponents/commingSoonSection";

const GetStarted = () => {
  return (
    <Box mt="6rem" p={4}>
      <QuoteSection />
      <WhyToUseSection />
      <PeopleReviews />
      <CommingSoonSection />
      <FooterSection />
    </Box>
  );
};

export default GetStarted;
