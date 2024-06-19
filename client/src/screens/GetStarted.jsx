import { Flex } from "@chakra-ui/react";
// import PeopleReviews from "../components/getStartedComponents/peopleReviewSection"; // Importing the PeopleReviews component
import WhyToUseSection from "../components/getStartedComponents/whyToUseSection";
import HeroSection from "../components/getStartedComponents/heroSection";
// import FooterSection from "../components/getStartedComponents/footerSection";
import CommingSoonSection from "../components/getStartedComponents/commingSoonSection";
import { useContext, useEffect, useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import SeasonalUpdateModal from "../components/getStartedComponents/SeasonalUpdateModal";
import { AppContext } from "../contextAPI/appContext";
import axios from "axios";
// import Loading from "../components/miscellaneous/Loading";

const GetStarted = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { state } = useContext(AppContext);

  const showNewSeasonModal = async () => {
    try {
      const response = await axios.get(
        "/api/user/newSeasonModal" // Adjust the URL as needed
      );
      if (response.status === 200 && response.data.show) {
        onOpen();
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!state.show) {
      showNewSeasonModal();
    }
  }, [state.show, onOpen]);

  return (
    <Flex
      mt={{ base: "4rem", lg: "5rem" }}
      flexDirection={"column"}
      overflow={"hidden"}
      letterSpacing={"2px"}
    >
      {state.user.newSeasonModal && (
        <SeasonalUpdateModal isOpen={isOpen} onClose={onClose} />
      )}
      <HeroSection />
      <WhyToUseSection />
      {/* <PeopleReviews /> */}
      <CommingSoonSection />
      {/* <FooterSection /> */}
    </Flex>
  );
};

export default GetStarted;
