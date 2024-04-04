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

const LeftProfileBox = ({ leftProfileView }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rank, setRank] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { state, dispatch } = useContext(AppContext);
  const [profileData, setProfileData] = useState({
    name: leftProfileView.name,
    pic: leftProfileView.pic,
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
        position:"top"
      });
      console.log(error.response.data.error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    //console.log(state.user);
    fetchRank();
  }, []);
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

  const handleSubmitModal = async(formData) => {
    // Add logic to handle form submission (e.g., updating profile data)
    try{
      const response = await axios.post(`/api/user/editProfile`,formData);
      if(response.status === 200){
        toast({
          title: "Success",
          description: "Profile Updated Successfully",
          status: "success",
          duration: 9000,
          isClosable: true,
          position:"top"
        })
      }
      setProfileData(formData);
    }
    catch(e){
      toast({
        title: "Error",
        description: "Something went wrong in fetching Rank",
        status: "error",
        duration: 9000,
        isClosable: true,
        position:"top"
      });
      console.error(e);
    }
  };

  // useEffect(()=>{},[rerender]);
  
  return (
    <Flex className="left-profile-box" flexDirection={"column"}>
      <Flex w={"100%"}>
        <Image
          src={profileData.pic}
          alt="Profile"
          borderRadius="10%"
          width="80px"
          height="80px"
          marginRight="20px"
        />
        <Box margin={"5px"}>
          <Heading as="h4" size={"md"}>
            {profileData.name}
          </Heading>
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
        <Text align={"justify"}>{profileData.bio}</Text>
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
      </Box>

      {profileData && <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={profileData}
        onSubmit={handleSubmitModal}
        setProfileData={setProfileData}
      />}

    </Flex>
  );
};

export default LeftProfileBox;
