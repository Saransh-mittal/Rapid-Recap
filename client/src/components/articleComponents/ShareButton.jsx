import React from "react";
import { Flex, Icon, Tooltip } from "@chakra-ui/react";
import { Share2 } from "lucide-react";
import Button from "../miscellaneous/ButtonComponent";
import ButtonGradient from "../../assets/svg/ButtonGradient";
import { LockIcon } from "@chakra-ui/icons";

const ShareButton = ({ onClick, isDisabled }) => {
  return (
    <Flex position={"relative"}>
      {isDisabled && (
        <Tooltip label="Please log in to share" placement="top">
          <LockIcon
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            color="white"
            boxSize={8}
            zIndex={2}
          />
        </Tooltip>
      )}
      <Flex
        style={
          isDisabled
            ? { filter: "blur(5px)", userSelect: "none" }
            : { userSelect: "text" }
        }
      >
        <Button onClick={onClick} buttonW="12rem">
          Share to Chat <Icon as={Share2} />
        </Button>
        <ButtonGradient />
      </Flex>
    </Flex>
  );
};

export default ShareButton;
