import React, { useState } from "react";
import { AppContext } from "../../contextAPI/appContext";
;
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

  const handleSubmit = (e) => {
    e.preventDefault();
  
    onSubmit(formData);
    onClose();
  };

  const submitImage = async (e)=>{
   
    try{
      const img = e.target.files[0];
      const data = new FormData();
    data.append("file",img);
    data.append("upload_preset","ProfilePics");
    data.append("cloud_name","dxstsrnbs")
    const response = await axios.post("https://api.cloudinary.com/v1_1/dxstsrnbs/image/upload",data);
    //console.log(response.data);
    const pic = response.data.url;
    setFormData({...formData,pic});
    }
    catch(e){
      console.log(e);
    }
  }

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

          <FormControl mb={4}>
            <FormLabel>Upload Profile Picture</FormLabel>
            <Input
              type="file"
              name="pic"
              accept="image/*"
   
              onChange={submitImage}
           
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
