import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../contextAPI/appContext";
import axios from "axios";
import EditProfileModal from "./EditProfileModal";
import Loading from "../miscellaneous/Loading";
import NameLightning from "../miscellaneous/NameLightning";
import CircleAndSocietyData from "../../assets/CircleAndSocietyData";

const LeftProfileBox = ({ leftProfileView }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rank, setRank] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { state, dispatch } = useContext(AppContext);
  const CURR_IQ = state.user.IQ_score;
  const MAX_IQ = state.user.maxIQScore;
  const [profileData, setProfileData] = useState({
    name: leftProfileView.name,
    pic: leftProfileView.pic
      ? leftProfileView.pic
      : "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    bio: leftProfileView.bio,
  });

  const fetchRank = async () => {
    try {
      //const response = await axios.get("/api/user/calculateUserRank");
      setRank(leftProfileView.rank);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong in fetching Rank",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      console.log(error.response.data.error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    //console.log(state.user);
    fetchRank();
  }, [leftProfileView]);
  const handleEditClick = () => {
    // Set profile data for modal
    setProfileData({
      name: leftProfileView.name,
      pic: leftProfileView.pic,
      bio: leftProfileView.bio,
    });
    // Open the modal
    setIsEditModalOpen(true);
  };

  const handleSubmitModal = async (formData) => {
    // Add logic to handle form submission (e.g., updating profile data)
    try {
      const response = await axios.post(`/api/user/editProfile`, formData);
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Profile Updated Successfully",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top",
        });
      }
      setProfileData(formData);
    } catch (e) {
      toast({
        title: "Error",
        description: "Something went wrong in fetching Rank",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      console.error(e);
    }
  };
  const findSocietyAndCircle = (IQ) => {
    for (let i = 0; i < CircleAndSocietyData.length; i++) {
      const { IQ_Lower, IQ_Upper } = CircleAndSocietyData[i];
      if (IQ >= IQ_Lower && (IQ_Upper === null || IQ < IQ_Upper)) {
        return CircleAndSocietyData[i];
      }
    }
    return null; // Return null if no match is found
  };

  const selectedDatafromMaxIQ = findSocietyAndCircle(MAX_IQ);
  const selectedDatafromCurrIQ = findSocietyAndCircle(CURR_IQ);
  return (
    <Flex className="left-profile-box" flexDirection={"column"}>
      <Flex w={"100%"}>
        <Image
          src={profileData?.pic}
          alt="Profile"
          borderRadius="10%"
          width="80px"
          height="80px"
          marginRight="20px"
        />
        <Box margin={"5px"} position={"relative"}>
          <Flex
            justifyContent={"center"}
            alignItems={"center"}
            w={"100%"}
            position="relative"
            marginBottom={"15px"}
          >
            <Heading
              as="h4"
              size={"md"}
              margin={"2px"}
              marginInline={"5px"}
              color={selectedDatafromCurrIQ?.textColor}
            >
              {profileData?.name}
            </Heading>
            <NameLightning
              boxShadow={selectedDatafromMaxIQ?.boxShadow}
              MAX_IQ={MAX_IQ}
            />
          </Flex>
          <Heading as="h6" fontSize={"12px"}>
            {leftProfileView.inGameName}
          </Heading>
          {isLoading ? (
            <Loading />
          ) : (
            <Heading as="h6" fontSize={"12px"}>
              Rank : {rank}
            </Heading>
          )}
        </Box>
      </Flex>
      <Box marginTop={"10px"} w={{ lg: "300px", base: "100%" }}>
        <Text align={"justify"}>{profileData?.bio}</Text>
        {window.location.pathname.split("/").pop() === state.user.inGameName ? (
          <Button
            size="md"
            height="35px"
            width="90%"
            border="5px"
            borderColor="green.200"
            backgroundColor="#F2D8D8" // Initial background color
            color="#374259" // Initial text color
            css={{
              "&:hover": {
                backgroundColor: "#316B83", // Change background color to green on hover
                color: "#11324D", // Change text color to white on hover
              },
            }}
            onClick={handleEditClick}
          >
            Edit Profile
          </Button>
        ) : null}
      </Box>

      {profileData && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profileData={profileData}
          onSubmit={handleSubmitModal}
          setProfileData={setProfileData}
          leftProfileView={leftProfileView}
        />
      )}
    </Flex>
  );
};

export default LeftProfileBox;
