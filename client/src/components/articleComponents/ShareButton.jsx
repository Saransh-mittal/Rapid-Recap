import React from "react";
import { Icon, Tooltip } from "@chakra-ui/react";
import { Share2 } from "lucide-react";
import Button from "../miscellaneous/ButtonComponent";
import ButtonGradient from "../../assets/svg/ButtonGradient";

const ShareButton = ({ onClick }) => {
  return (
    <>
      <Button onClick={onClick} buttonW="12rem">
        Share to Chat <Icon as={Share2} />
      </Button>
      <ButtonGradient />
    </>
  );
};

export default ShareButton;
