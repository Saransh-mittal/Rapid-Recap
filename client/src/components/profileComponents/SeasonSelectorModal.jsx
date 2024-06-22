// /components/SeasonSelectorModal.jsx
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Flex,
  useDisclosure,
  useMediaQuery,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import Button from "../miscellaneous/ButtonComponent";
import ButtonGradient from "../../assets/svg/ButtonGradient";
import SeasonModal from "./SeasonModal";
import axios from "axios";

const SeasonSelectorModal = ({
  isOpen,
  onClose,
  currSeason,
  loginedUserProfile,
  inGameName,
  seasons,
}) => {
  const {
    onOpen: onOpenSeasonModal,
    onClose: onCloseSeasonModal,
    isOpen: isOpenSeasonModal,
  } = useDisclosure();
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [isLargerThan992px] = useMediaQuery("(min-width: 992px)");
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchSeasonHistory = async (season) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/user/seasonHistory/${inGameName}?season=${season}`
      );

      setProfile(response.data);
    } catch (error) {
      onCloseSeasonModal();
      setSelectedSeason(null);
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch season history.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeasonClick = (season) => {
    if (selectedSeason === season) {
      onCloseSeasonModal();
      setSelectedSeason(null);
    } else {
      (seasons.includes(season) || season == currSeason) &&
        fetchSeasonHistory(season);
      setSelectedSeason(season);
      onOpenSeasonModal();
    }
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement={isLargerThan992px ? "left" : "top"}
        onClose={() => {
          onCloseSeasonModal();
          onClose();
        }}
      >
        <DrawerOverlay />
        <DrawerContent
          backgroundColor="#0f0d15"
          color="white"
          borderRadius="10px"
          width={{ base: "100vw !important", lg: "15rem !important" }}
        >
          <DrawerCloseButton />
          <DrawerHeader textAlign={"center"} mt={{ base: "0", lg: "2rem" }}>
            Select Season
          </DrawerHeader>

          <DrawerBody>
            <ButtonGradient />
            <Flex
              w={"100%"}
              justifyContent={"center"}
              alignItems={"center"}
              flexDirection={!isLargerThan992px ? "row" : "column"}
              gap={4}
            >
              {Array.from({ length: currSeason }, (_, i) => (
                <Button
                  key={i}
                  white={selectedSeason === i + 1}
                  onClick={() => handleSeasonClick(i + 1)}
                >
                  Season {i + 1}
                </Button>
              ))}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <SeasonModal
        notInTheSeason={
          !seasons.includes(selectedSeason) && selectedSeason !== currSeason
        }
        isOpen={isOpenSeasonModal}
        onClose={() => {
          onCloseSeasonModal();
          setSelectedSeason(null);
        }}
        season={selectedSeason}
        isLoading={isLoading}
        profile={profile}
        privacyProfileData={false}
        loginedUserProfile={loginedUserProfile}
        inGameName={inGameName}
      />
    </>
  );
};

export default SeasonSelectorModal;
