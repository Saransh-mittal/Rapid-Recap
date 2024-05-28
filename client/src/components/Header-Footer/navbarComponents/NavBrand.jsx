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
          width={{
            base: isHamburgerOpen ? "1.5rem" : "3rem",
            md: isHamburgerOpen ? "2rem" : "5rem",
            lg: "2.5rem",
          }}
          height={"2.5rem"}
          background={"transparent"}
          marginRight={"-5px"}
        />
        <Image
          src={Logo}
          alt="Rapid Recap"
          width={{
            base: isHamburgerOpen ? "5rem" : "10rem",
            md: "6rem",
            lg: "9rem",
          }}
          height={"2.5rem"}
          background={"transparent"}
        />
      </Flex>
    </NavLink>
  );
};

export default NavBrand;
