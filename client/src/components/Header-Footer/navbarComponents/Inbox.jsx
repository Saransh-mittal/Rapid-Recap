import { EmailIcon } from "@chakra-ui/icons";
import { Badge, Button, Flex } from "@chakra-ui/react";
import React from "react";

const Inbox = ({
  className,
  marginLeftButton,
  onClick,
  notifyCont,
  display,
  h = "6",
  w = "6",
}) => {
  return (
    <>
      <Flex className={className} display={display}>
        <Button
          display={display}
          background={"transparent"}
          padding={0}
          marginLeft={marginLeftButton}
          color={"white"}
          _hover={{ background: "transparent" }}
          onClick={onClick} // Open drawer onClick
          h={"fit-content"}
        >
          <EmailIcon width={w} height={h} />
          {notifyCont > 0 && (
            <Badge
              borderRadius="50%"
              h={"20px"}
              w={"20px"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              backgroundColor="red"
              color="white"
              fontSize="md"
              position="absolute"
              top="-1px"
              right="-1px"
              padding="2px"
            >
              {notifyCont}
            </Badge>
          )}
        </Button>
      </Flex>
    </>
  );
};

export default Inbox;
