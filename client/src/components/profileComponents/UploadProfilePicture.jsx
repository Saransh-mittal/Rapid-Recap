import React, { useState } from "react";
import { Button } from "@chakra-ui/react";

const UploadProfilePicture = ({ onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    const { files } = await window.cloudinary.createUploadWidget({
      cloudName: "your_cloud_name",
      uploadPreset: "your_upload_preset",
      sources: ["local", "url"],
      multiple: false,
      cropping: true,
      croppingAspectRatio: 1, // Square aspect ratio for profile picture
      folder: "profile_pictures", // Optional folder in Cloudinary
      resourceType: "image",
    }).open();

    // Once upload is complete, get the URL and pass it to the parent component
    if (files) {
      const imageUrl = files[0].uploadInfo.secure_url;
      onUpload(imageUrl);
    }
  };

  return (
    <Button onClick={handleUpload} isLoading={isUploading}>
      Upload Profile Picture
    </Button>
  );
};

export default UploadProfilePicture;
