import React from "react";
import { Button, useDisclosure } from "@chakra-ui/react";
import "./GetStarted.css";
import Signin from "../../../screens/Signin";

const GetStarted = ({ display = "flex", innerText, hamburgerOnClose }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button display={display} className="get-started-button" onClick={onOpen}>
        {innerText}
      </Button>
      <Signin
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        hamburgerOnClose={hamburgerOnClose}
      />
    </>
  );
};

export default GetStarted;
