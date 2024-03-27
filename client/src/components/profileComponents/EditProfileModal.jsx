import React, { useState, useEffect } from "react";
import { AppContext } from "../../contextAPI/appContext";
import UploadProfilePicture from "./UploadProfilePicture";
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


const EditProfileModal = ({ isOpen, onClose, profileData,setProfileData, onSubmit }) => {
  const {state}= React.useContext(AppContext);
  const [formData, setFormData] = useState(profileData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  // useEffect(()=>{
  //   console.log(profileData);
  // },[])
 

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setPreviewImage(reader.result);
  //     };
  //     reader.readAsDataURL(file);
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       profilePicture: file,
  //     }));
  //   }
  // };

  const handleImageUpload = (imageUrl) => {
    setFormData((prevData) => ({
      ...prevData,
      pic: imageUrl,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={()=>{onClose(); setProfileData(null);}} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box display="flex" justifyContent="center" mb={4}>
            <Image
              src={formData.pic}
              alt="Profile Picture"
              boxSize="150px"
              borderRadius="full"
              mb={4}
            />
          </Box>
          {/* <FormControl mb={4}>
            <FormLabel>Upload Profile Picture</FormLabel>
            <UploadProfilePicture onUpload={handleImageUpload} />
          </FormControl> */}
          <FormControl mb={4}>
            <FormLabel>Upload Profile Picture</FormLabel>
            <Input
              type="file"
              name="pic"
              accept="image/*"
              onChange={handleImageUpload}
            />
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
