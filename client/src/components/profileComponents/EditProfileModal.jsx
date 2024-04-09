import React, { useState } from "react";
import { AppContext } from "../../contextAPI/appContext";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Image,
  Box,
} from "@chakra-ui/react";
import axios from "axios";

const EditProfileModal = ({
  isOpen,
  onClose,
  profileData,
  setProfileData,
  onSubmit,
  leftProfileView,
}) => {
  const { state } = React.useContext(AppContext);
  const [formData, setFormData] = useState(profileData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const submitImage = async (e) => {
    try {
      const img = e.target.files[0];
      const data = new FormData();
      data.append("file", img);
      data.append("upload_preset", "ProfilePics");
      data.append("cloud_name", "dxstsrnbs");
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dxstsrnbs/image/upload",
        data
      );
      const pic = response.data.url;
      setFormData({ ...formData, pic });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setProfileData({
          name: leftProfileView.name,
          pic: leftProfileView.pic
            ? leftProfileView.pic
            : "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
          bio: leftProfileView.bio,
        });
      }}
      size="xl"
    >
      <ModalOverlay />
      <ModalContent style={{ backgroundColor: "#0f0d15", color: "white" }}>
        <ModalHeader fontSize="3xl">Edit Profile</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody width={"80%"}>
          <Box display="flex" justifyContent="center" mb={4}>
            <Image
              src={formData.pic}
              alt="Profile Picture"
              boxSize="150px"
              borderRadius="full"
              mb={4}
            />
          </Box>

          <FormControl mb={4}>
            <Box display="flex" justifyContent="center">
              <FormLabel htmlFor="profile-pic" color="white" fontWeight="bold">
                Upload Profile Picture
              </FormLabel>
            </Box>
            <Input
              id="profile-pic"
              type="file"
              name="pic"
              accept="image/*"
              onChange={submitImage}
              display="none"
            />
            <label htmlFor="profile-pic">
              <Button as="span" colorScheme="blue" size="sm">
                Choose File
              </Button>
            </label>
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Bio</FormLabel>
            <Textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Save Changes
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditProfileModal;
