import { Flex, Image } from "@chakra-ui/react";
import React from "react";
import { NavLink } from "react-router-dom";
import Logo from "/images/Rapid_Recap-withoutBG.png";
import Mic from "/images/mic.png";

const NavBrand = ({ isHamburgerOpen }) => {
  return (
    <NavLink to="/" className={`navbar-brand`}>
      <Flex position={!isHamburgerOpen ? "absolute" : "relative"}>
        <Image
          src={Mic}
          alt="Rapid Recap"
          width={{
            base: isHamburgerOpen ? "1.5rem" : "1.2rem",
            md: "2rem",
          }}
          height={"2.5rem"}
          background={"transparent"}
          marginRight={"-5px"}
        />
        <Image
          src={Logo}
          alt="Rapid Recap"
          width={{
            base: isHamburgerOpen ? "5rem" : "4.8rem",
            md: "6rem",
          }}
          height={"2.5rem"}
          background={"transparent"}
        />
      </Flex>
    </NavLink>
  );
};

export default NavBrand;
