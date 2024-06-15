import { Flex } from "@chakra-ui/react";
// import PeopleReviews from "../components/getStartedComponents/peopleReviewSection"; // Importing the PeopleReviews component
import WhyToUseSection from "../components/getStartedComponents/whyToUseSection";
import HeroSection from "../components/getStartedComponents/heroSection";
// import FooterSection from "../components/getStartedComponents/footerSection";
import CommingSoonSection from "../components/getStartedComponents/commingSoonSection";
import { useEffect, useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import SeasonalUpdateModal from "../components/getStartedComponents/SeasonalUpdateModal";
// import Loading from "../components/miscellaneous/Loading";

const GetStarted = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mocking the logged-in state

  useEffect(() => {
    // Replace this with your actual login condition check
    const checkLogin = async () => {
      // Simulate an API call to check login status
      const loggedIn = await fakeApiCallToCheckLogin(); // Replace with your actual API call
      setIsLoggedIn(loggedIn);
    };

    checkLogin();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      onOpen();
    }
  }, [isLoggedIn, onOpen]);

  // Mock API call
  const fakeApiCallToCheckLogin = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(false); // Set to true to simulate a logged-in user
      }, 1000); // Simulate a delay
    });
  };

  return (
    <Flex
      mt={{ base: "4rem", lg: "5rem" }}
      flexDirection={"column"}
      overflow={"hidden"}
      letterSpacing={"2px"}
    >
      <SeasonalUpdateModal isOpen={isOpen} onClose={onClose} />
      <HeroSection />
      <WhyToUseSection />
      {/* <PeopleReviews /> */}
      <CommingSoonSection />
      {/* <FooterSection /> */}
    </Flex>
  );
};

export default GetStarted;
