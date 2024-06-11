import { Flex } from "@chakra-ui/react";
// import PeopleReviews from "../components/getStartedComponents/peopleReviewSection"; // Importing the PeopleReviews component
import WhyToUseSection from "../components/getStartedComponents/whyToUseSection";
import HeroSection from "../components/getStartedComponents/heroSection";
// import FooterSection from "../components/getStartedComponents/footerSection";
import CommingSoonSection from "../components/getStartedComponents/commingSoonSection";
// import Loading from "../components/miscellaneous/Loading";

const GetStarted = () => {
  return (
    <Flex
      mt={{ base: "4rem", lg: "5rem" }}
      flexDirection={"column"}
      overflow={"hidden"}
      letterSpacing={"2px"}
    >
      {/* <Skeleton isLoaded={bgLoaded}> */}
      <HeroSection />
      <WhyToUseSection />
      {/* <PeopleReviews /> */}
      <CommingSoonSection />
      {/* <FooterSection /> */}
      {/* </Skeleton> */}
    </Flex>
  );
};

export default GetStarted;
