import { Button } from "@chakra-ui/react";
import React from "react";
import "./GetStarted.css";

const GetStarted = ({ display = "flex" }) => {
  return (
    <Button display={display} className="get-started-button">
      {" "}
      Get Started
    </Button>
  );
};

export default GetStarted;
