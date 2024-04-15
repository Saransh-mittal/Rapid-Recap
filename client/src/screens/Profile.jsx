import React, { useContext, useEffect, useState } from "react";
import { Box, Flex, Tag, Text, Tooltip } from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { AppContext } from "../contextAPI/appContext";
import IQLineGraph from "../components/profileComponents/IQLineGraph";
import IQBarGraph from "../components/profileComponents/IQBarGraph";
import LeftProfileBox from "../components/profileComponents/LeftProfileBox";
import SolvedQuizzes from "../components/profileComponents/SolvedQuizzes";
import RankAndSociety from "../components/profileComponents/RankAndSociety";
import DailyActivity from "../components/profileComponents/DailyActivity";
import { useParams } from "react-router-dom";
import axios from "axios";
import Loading from "../components/miscellaneous/Loading";
import { useShepherdTour } from "react-shepherd";
import stepsTutorialProfile from "../components/profileComponents/stepsTutorialProfile";
import ToggleProfileVisibilty from "../components/profileComponents/LeftProfileSubComponents/ToggleProfileVisibilty.jsx";

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
  },
  useModalOverlay: true,
};
export default function Profile() {
  const tour = useShepherdTour({ tourOptions, steps: stepsTutorialProfile });
  const { inGameName } = useParams();
  const { state, dispatch } = useContext(AppContext);
  const [profile, setProfile] = useState(state.userProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [showHideModal, setShowHideModal] = useState(false);

  const loginedUserProfile = inGameName === state.user.inGameName;
  const [privacyProfileData, setPrivacyProfileData] = useState({
    fullProfile: false,
    lineGraph: false,
    barGraph: false,
    solvedQuizzes: false,
    society: false,
    dailyActivity: false,
  });
  //const [rerender, setRerender] = useState(false);

  const isTutorialTakenCheck = async () => {
    try {
      const Page = "profilePage";
      const response = await axios.get(
        `/api/user/isTutorialTakenCheck/${Page}`
      );
      console.log(response.data);
      if (response.data.status) tour.start();
    } catch (err) {
      toast({
        title: "Error in Checking tutorial taken",
        description: err,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };
  const isTutorialTakenUpdate = async () => {
    try {
      const page = "profilePage";
      const response = await axios.post(`/api/user/isTutorialTakenUpdate`, {
        page,
      });
      console.log(response.data);
    } catch (err) {
      toast({
        title: "Error in updating tutorial taken",
        description: err,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/user/profile/${inGameName}`);
      setProfile(() => response.data);
      if (inGameName === state.user.inGameName)
        dispatch({ type: "profile", payloadProfile: response.data });
      else {
        setPrivacyProfileData(() => response.data.profilePrivacy);
        dispatch({
          type: "otherUserProfiles",
          payloadOtherUserProfiles: [
            ...state.otherUserProfiles,
            { profile: response.data, inGameName: inGameName },
          ],
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const body = document.querySelector("body");
    const handleTourStart = () => {
      body.style.overflow = "hidden"; // Reapply scroll behavior
      const overlay = document.createElement("div");
      overlay.classList.add("custom-overlay");
      const overlayNav = document.createElement("div");
      overlayNav.classList.add("custom-overlay-nav");
      document.querySelector(".profile-info")?.appendChild(overlay);
      document.querySelector(".profile-info")?.classList.add("shepherd-active");
      document.querySelector(".navbar").appendChild(overlayNav);
      document.querySelector(".navbar").classList.add("shepherd-active");
    };

    const handleTourComplete = () => {
      body.style.overflow = "auto";
      const dailyAct = document.querySelector(".daily-activity");
      if (dailyAct) {
        dailyAct.classList.remove("highlighted-card-1");
      }
      const navbar = document.querySelector(".navbar");
      navbar.classList.remove("shepherd-active");
      const leftProfileBox = document.querySelector(".left-profile-box");
      leftProfileBox.classList.remove("shepherd-active");
      const iqBarGraph = document.querySelector(".iq-bar-graph");
      const iqlineGraph = document.querySelector(".iq-line-graph");
      const solvedQuizzes = document.querySelector(".solved-quizzes");
      const rankAndSociety = document.querySelector(".rank-and-society");

      iqBarGraph.classList.remove("shepherd-active");
      iqlineGraph.classList.remove("shepherd-active");
      solvedQuizzes.classList.remove("shepherd-active");
      rankAndSociety.classList.remove("shepherd-active");
      const overlay = document.querySelector(".custom-overlay");
      if (overlay) overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      if (overlayNav) overlayNav.remove();
      isTutorialTakenUpdate();
    };

    const handleTourCancel = () => {
      body.style.overflow = "auto";
      const dailyAct = document.querySelector(".daily-activity");
      if (dailyAct) {
        dailyAct.classList.remove("highlighted-card-1");
      }
      const navbar = document.querySelector(".navbar");
      navbar.classList.remove("shepherd-active");
      const leftProfileBox = document.querySelector(".left-profile-box");
      leftProfileBox.classList.remove("shepherd-active");
      const iqBarGraph = document.querySelector(".iq-bar-graph");
      const iqlineGraph = document.querySelector(".iq-line-graph");
      const solvedQuizzes = document.querySelector(".solved-quizzes");
      const rankAndSociety = document.querySelector(".rank-and-society");

      iqBarGraph.classList.remove("shepherd-active");
      iqlineGraph.classList.remove("shepherd-active");
      solvedQuizzes.classList.remove("shepherd-active");
      rankAndSociety.classList.remove("shepherd-active");

      const overlay = document.querySelector(".custom-overlay");
      if (overlay) overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      if (overlayNav) overlayNav.remove();
      isTutorialTakenUpdate();
    };

    tour.on("start", handleTourStart);
    tour.on("complete", handleTourComplete);
    tour.on("cancel", handleTourCancel);

    return () => {
      tour.off("start", handleTourStart);
      tour.off("complete", handleTourComplete);
      tour.off("cancel", handleTourCancel);
    };
  }, [tour]);
  useEffect(() => {
    //console.log("Profile Page");
    const otherUserStored = state.otherUserProfiles?.find((user) => {
      return user?.inGameName === inGameName;
    });
    //console.log(otherUserStored);
    if (inGameName === state.user.inGameName && state.userProfile) {
      setProfile(state.userProfile);
      setPrivacyProfileData(
        state.userProfile.profilePrivacy
          ? state.userProfile.profilePrivacy
          : privacyProfileData
      );
      setIsLoading(false);
    } else if (otherUserStored) {
      setProfile(otherUserStored.profile);
      setPrivacyProfileData(
        otherUserStored.profile.profilePrivacy
          ? otherUserStored.profile.profilePrivacy
          : privacyProfileData
      );
      setIsLoading(false);
    } else {
      fetchProfile();
    }
    if (state.user && state.user.tutorial.profilePage) isTutorialTakenCheck();
  }, [inGameName]);

  return (
    <Box marginTop={"4.5rem"} w={"100%"}>
      <Flex
        flexDirection={{ base: "column", md: "row" }}
        marginTop="20px"
        marginInline={{ base: "0", xl: "6.5%" }}
        alignItems={{ base: "center", md: "normal" }}
        justifyContent={{ base: "center", md: "center", lg: "normal" }}
        className="profile-info"
      >
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <Flex
              margin="20px"
              padding="15px"
              borderRadius="10px"
              flexDirection="column"
              w={{ md: "300px", lg: "350px", base: "95%" }}
              height="fit-content"
              style={{
                backgroundColor: "#0f0d15",
                backgroundImage:
                  "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
                boxShadow:
                  "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)", // Increased intensity of the shadow
              }}
            >
              {showHideModal && (
                <ToggleProfileVisibilty setShowHideModal={setShowHideModal} />
              )}
              {inGameName === state.user.inGameName && (
                <Tooltip label="Toggle Profile Visibility">
                  <ViewIcon
                    marginLeft={"auto"}
                    onClick={() => setShowHideModal(true)}
                    _hover={{ cursor: "pointer" }}
                  />
                </Tooltip>
              )}
              <LeftProfileBox
                leftProfileView={profile.leftProfileView}
                CURR_IQ={profile?.USER_IQ}
                MAX_IQ={profile?.maxIQScore}
              />
            </Flex>
            <Flex
              w={{
                xl: "calc(100% - 400px)",
                md: "calc(100% - 460px)",
                sm: "100%",
                base: "100%",
              }}
              flexDirection="column"
              margin="12px"
              justifyContent={"center"}
              alignItems={"center"}
              borderRadius="10px"
              className="right-profile-box"
            >
              <Flex
                w={"100%"}
                marginTop={"10px"}
                marginInline={"1%"}
                padding={{ xl: "20px", base: "0" }}
                borderRadius="10px"
                flexDirection={{ base: "column", xl: "row" }}
                backgroundColor={{ base: "transparent", xl: "#0f0d15" }}
                backgroundImage={{
                  base: "none",
                  xl: "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
                }}
                boxShadow={{
                  base: "none",
                  xl: "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
                }}
                gap={{ base: "20px", xl: "0" }}
              >
                <IQLineGraph
                  lineGraph={profile.lineGraph}
                  privateLineGraph={privacyProfileData.lineGraph}
                  loginedUserProfile={loginedUserProfile}
                />

                <IQBarGraph
                  barGraph={profile.barGraph}
                  privateBarGraph={privacyProfileData.lineGraph}
                  loginedUserProfile={loginedUserProfile}
                />
              </Flex>

              <Flex
                w={"100%"}
                margin="10px"
                marginBottom="5px"
                flexDirection={{ xl: "row", base: "column" }}
                justifyContent="space-between"
                gap={5}
              >
                <Flex
                  borderRadius="10px"
                  width={"100%"}
                  style={{
                    backgroundColor: "#0f0d15",
                    backgroundImage:
                      "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
                    boxShadow:
                      "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)", // Increased intensity of the shadow
                  }}
                  className="solved-quizzes"
                  _hover={
                    !privacyProfileData.solvedQuizzes
                      ? {
                          transform: "scale(1.01)",
                        }
                      : null
                  }
                  _active={
                    !privacyProfileData.solvedQuizzes
                      ? {
                          transform: "scale(0.9)",
                          borderColor: "#bec3c9",
                        }
                      : null
                  }
                >
                  <SolvedQuizzes
                    privateSolvedQuiz={privacyProfileData.solvedQuizzes}
                    loginedUserProfile={loginedUserProfile}
                    solvedQuizzes={profile.solvedQuizzes}
                    inGameName={inGameName}
                  />
                </Flex>
                <Flex
                  borderRadius="10px"
                  width={"100%"}
                  style={{
                    backgroundColor: "#0f0d15",
                    backgroundImage:
                      "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
                    boxShadow:
                      "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)", // Increased intensity of the shadow
                  }}
                  className="rank-and-society"
                >
                  <RankAndSociety
                    privateSociety={privacyProfileData.society}
                    loginedUserProfile={loginedUserProfile}
                    USER_IQ={profile?.barGraph?.USER_IQ}
                  />
                </Flex>
              </Flex>
              <Box
                w={"100%"}
                margin="10px"
                p={"10px"}
                borderRadius="10px"
                style={{
                  backgroundColor: "#0f0d15",
                  backgroundImage:
                    "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
                  boxShadow:
                    "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)", // Increased intensity of the shadow
                }}
                className="daily-activity"
              >
                <DailyActivity
                  dailyAct={profile.dailyActivity}
                  privateDailyAct={privacyProfileData.dailyActivity}
                  loginedUserProfile={loginedUserProfile}
                />
              </Box>
            </Flex>
          </>
        )}
      </Flex>
    </Box>
  );
}
