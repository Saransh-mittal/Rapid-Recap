import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Tooltip,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
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
import ToggleProfileVisibilty from "../components/profileComponents/LeftProfileSubComponents/ToggleProfileVisibilty.jsx";
import { useProfileTour } from "../customHooks/useTours.js";

export default function Profile() {
  const { tour, isTutorialTakenCheck } = useProfileTour();
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
    document.title = "Profile page";
    const otherUserStored = state.otherUserProfiles?.find((user) => {
      return user?.inGameName === inGameName;
    });

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
  }, [inGameName]);

  useEffect(() => {
    if (
      !isLoading &&
      !state.show &&
      state.user &&
      state.user.tutorial.profilePage &&
      loginedUserProfile
    )
      isTutorialTakenCheck({ page: "profilePage", tour });
  }, [isLoading]);

  return (
    <Box marginTop={"4.5rem"} w={"100%"}>
      <Flex
        flexDirection={{ base: "column", md: "row" }}
        marginTop="20px"
        marginInline={{ base: "2%", xl: "6.5%" }}
        alignItems={{ base: "center", md: "normal" }}
        justifyContent={{ base: "center", md: "center", lg: "normal" }}
        className="profile-info"
      >
        <Flex flexDirection={"column"} width={"100%"}>
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
            {isLoading ? (
              <>
                <SkeletonCircle size="10" />
                <SkeletonText mt="4" noOfLines={4} spacing="4" />
              </>
            ) : (
              <LeftProfileBox
                leftProfileView={profile?.leftProfileView}
                CURR_IQ={profile?.USER_IQ}
                MAX_IQ={profile?.maxIQScore}
              />
            )}
          </Flex>
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
            padding={{ xl: isLoading ? 0 : "20px", base: "0" }}
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
            {isLoading ? (
              <>
                <Skeleton
                  height="200px"
                  width="100%"
                  borderRadius="10px"
                  marginRight={5}
                />
                <Skeleton height="200px" width="100%" borderRadius="10px" />
              </>
            ) : (
              <>
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
              </>
            )}
          </Flex>

          <Flex
            w={"100%"}
            margin="10px"
            marginBottom="5px"
            flexDirection={{ xl: "row", base: "column" }}
            justifyContent="space-between"
            gap={5}
          >
            {isLoading ? (
              <>
                <Skeleton height="150px" width="100%" borderRadius="10px" />
                <Skeleton height="150px" width="100%" borderRadius="10px" />
              </>
            ) : (
              <>
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
              </>
            )}
          </Flex>
          <Box
            w={"100%"}
            margin="10px"
            p={isLoading ? 0 : "10px"}
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
            {isLoading ? (
              <Skeleton height="150px" width="100%" borderRadius="10px" />
            ) : (
              <DailyActivity
                dailyAct={profile.dailyActivity}
                privateDailyAct={privacyProfileData.dailyActivity}
                loginedUserProfile={loginedUserProfile}
              />
            )}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
