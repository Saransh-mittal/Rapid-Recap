import { Flex, Image } from "@chakra-ui/react";
import React from "react";
import { NavLink } from "react-router-dom";
import Logo from "/images/Rapid_Recap-withoutBG.png";
import Mic from "/images/mic.png";

const NavBrand = ({ isHamburgerOpen }) => {
  return (
    <NavLink to="/" className={`navbar-brand`}>
      <Flex>
        <Image
          src={Mic}
          alt="Rapid Recap"
          width="30px"
          height={"40px"}
          background={"transparent"}
          marginRight={"-5px"}
        />
        <Image
          src={Logo}
          alt="Rapid Recap"
          width="120px"
          height={"40px"}
          background={"transparent"}
        />
      </Flex>
    </NavLink>
  );
};

export default NavBrand;
