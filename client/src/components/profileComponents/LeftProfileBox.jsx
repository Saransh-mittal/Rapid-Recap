import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  useToast,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../contextAPI/appContext";
import axios from "axios";
import EditProfileModal from "./EditProfileModal";
import NameLightning from "../miscellaneous/NameLightning";
import CircleAndSocietyData from "../../assets/CircleAndSocietyData";
import { FaUserPlus } from "react-icons/fa";

const LeftProfileBox = ({ leftProfileView, CURR_IQ, MAX_IQ }) => {
  const toast = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { state, dispatch } = useContext(AppContext);
  const [profileData, setProfileData] = useState({
    name: leftProfileView.name,
    pic: leftProfileView.pic
      ? leftProfileView.pic
      : "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    bio: leftProfileView.bio,
  });
  const [loading, setLoading] = useState(true);
  const [canSendRequest, setCanSendRequest] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    setProfileData({
      name: leftProfileView.name,
      pic: leftProfileView.pic
        ? leftProfileView.pic
        : "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
      bio: leftProfileView.bio,
    });
  }, [leftProfileView]);

  const handleEditClick = () => {
    setProfileData({
      name: leftProfileView.name,
      pic: leftProfileView.pic,
      bio: leftProfileView.bio,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitModal = async (formData) => {
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
        description: "Something went wrong in updating profile",
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

  const checkCanSendRequest = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/friends/can-send-request", {
        fromId: state.user._id,
        toId: leftProfileView._id,
      });
      if (
        response.status === 200 &&
        response.data.message === "Can send request"
      ) {
        setCanSendRequest(true);
      } else {
        if (response.data.friend === true) {
          setIsFriend(true);
        } else if (!response.data.allowed) setCanSendRequest(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error checking friend request status",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/friends/send-request", {
        fromId: state.user._id,
        toId: leftProfileView._id,
      });
      if (response.status === 200) {
        setRequestSent(true);
        toast({
          title: "Success",
          description: "Friend request sent successfully",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error sending friend request",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkCanSendRequest();
  }, []);

  const handleRequestClick = async () => {
    if (canSendRequest && !requestSent) {
      await sendFriendRequest();
    }
  };

  return (
    <Flex className="left-profile-box" flexDirection={"column"} w={"100%"}>
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

          <Heading as="h6" fontSize={"12px"}>
            Rank : {leftProfileView.rank}
          </Heading>
        </Box>
        {window.location.pathname.split("/").pop() !==
          state.user.inGameName && (
          <Flex marginLeft={"1.5rem"} paddingTop={"10px"}>
            {loading ? (
              <Spinner />
            ) : isFriend ? (
              <Badge
                colorScheme="green"
                variant="solid"
                borderRadius="full"
                px={2}
                height={"fit-content"}
                py={1}
              >
                Sage Ally
              </Badge>
            ) : (
              <Flex
                h={"fit-content"}
                cursor={
                  canSendRequest && !requestSent ? "pointer" : "not-allowed"
                }
                onClick={handleRequestClick}
                disabled={!canSendRequest || requestSent}
              >
                <FaUserPlus
                  size={20}
                  color={!canSendRequest || requestSent ? "grey" : "white"}
                />
              </Flex>
            )}
          </Flex>
        )}
      </Flex>

      <Box marginTop={"10px"} w={{ lg: "300px", base: "100%" }}>
        <Text align={"justify"}>{profileData?.bio}</Text>
        {window.location.pathname.split("/").pop() === state.user.inGameName ? (
          <Flex w={"100%"} justifyContent={"center"}>
            <Button
              size="md"
              height="35px"
              width="90%"
              border="5px"
              borderColor="green.200"
              backgroundColor="#F2D8D8"
              color="#374259"
              css={{
                "&:hover": {
                  backgroundColor: "#316B83",
                  color: "#11324D",
                },
              }}
              onClick={handleEditClick}
            >
              Edit Profile
            </Button>
          </Flex>
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
